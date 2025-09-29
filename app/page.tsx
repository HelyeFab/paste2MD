'use client'

import { useState, useCallback, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { convertToMarkdown } from '@/lib/markdown-converter'
import { ThemeToggle } from '@/components/theme-toggle'
import { Logo } from '@/components/logo'
import { LLMSettings } from '@/components/llm-settings'
import { FeaturesGallery } from '@/components/features-gallery'
import { BuyMeCoffee } from '@/components/buy-me-coffee'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Loader } from '@/components/ui/loader'
import { toast } from '@/hooks/use-toast'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Copy, Download, Settings,
  Sparkles, Smile, RefreshCw, Wand2, Trash2, CheckCircle
} from 'lucide-react'
import { type LLMConfig, getLLMConfig } from '@/lib/llm-config'

const STORAGE_KEY = 'paste2md-input'

export default function Home() {
  const [inputText, setInputText] = useState('')
  const [markdownText, setMarkdownText] = useState('')
  const [useAI, setUseAI] = useState(false)
  const [addEmojis, setAddEmojis] = useState(true)
  const [aiAvailable, setAiAvailable] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [customInstructions, setCustomInstructions] = useState('')
  const [showInstructions, setShowInstructions] = useState(false)
  const [isCopying, setIsCopying] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [llmConfig, setLlmConfig] = useState<LLMConfig | null>(null)

  // Load saved text and LLM config from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      setInputText(saved)
      // Process the saved text with basic conversion
      const converted = convertToMarkdown(saved)
      setMarkdownText(converted)
      toast({
        title: "Previous session restored",
        description: "Your text has been loaded from the last session",
      })
    }

    // Load LLM configuration
    const config = getLLMConfig()
    setLlmConfig(config)
  }, [])

  // Save to localStorage whenever input changes
  useEffect(() => {
    if (inputText) {
      localStorage.setItem(STORAGE_KEY, inputText)
    } else {
      localStorage.removeItem(STORAGE_KEY)
    }
  }, [inputText])

  // Check if LLM is available when config changes
  useEffect(() => {
    if (!llmConfig) return

    const params = new URLSearchParams({
      provider: llmConfig.provider,
      serverUrl: llmConfig.serverUrl,
      selectedModel: llmConfig.selectedModel,
    })

    fetch(`/api/enhance?${params}`)
      .then(res => res.json())
      .then(data => {
        setAiAvailable(data.available && data.hasModel)
        if (data.available && !data.hasModel) {
          toast({
            variant: "destructive",
            title: "AI Model Missing",
            description: `Model "${llmConfig.selectedModel}" not found. Check your LLM settings.`,
          })
        }
      })
      .catch(() => setAiAvailable(false))
  }, [llmConfig])

  const processWithAI = async (text: string): Promise<string> => {
    try {
      const response = await fetch('/api/enhance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          addEmojis,
          customInstructions,
          llmConfig
        })
      })

      if (!response.ok) {
        throw new Error('AI enhancement failed')
      }

      const data = await response.json()
      return data.markdown || text
    } catch (err: any) {
      console.error('AI enhancement error:', err)
      toast({
        variant: "destructive",
        title: "AI Enhancement Failed",
        description: err.message || "Falling back to basic conversion",
      })
      return convertToMarkdown(text)
    }
  }

  const handleInputChange = useCallback(async (text: string, showToast = false) => {
    setInputText(text)
    setIsProcessing(true)

    if (showToast) {
      toast({
        title: "Processing",
        description: useAI ? "AI is formatting your text..." : "Converting to markdown...",
      })
    }

    try {
      if (useAI && aiAvailable && text.trim()) {
        const enhanced = await processWithAI(text)
        setMarkdownText(enhanced)
        if (showToast) {
          toast({
            variant: "success",
            title: "AI Processing Complete",
            description: addEmojis ? "Text formatted with emojis!" : "Text formatted successfully!",
          })
        }
      } else if (text.trim()) {
        const converted = convertToMarkdown(text)
        setMarkdownText(converted)
        if (showToast) {
          toast({
            variant: "success",
            title: "Conversion Complete",
            description: "Text has been converted to markdown",
          })
        }
      } else {
        setMarkdownText('')
      }
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Conversion Failed",
        description: "An error occurred while processing your text",
      })
      setMarkdownText(text)
    } finally {
      setIsProcessing(false)
    }
  }, [useAI, aiAvailable, addEmojis, customInstructions])

  const handleCopy = async () => {
    setIsCopying(true)
    try {
      await navigator.clipboard.writeText(markdownText)
      toast({
        variant: "success",
        title: "Copied!",
        description: "Markdown copied to clipboard",
      })
    } catch (err) {
      console.error('Failed to copy:', err)
      toast({
        variant: "destructive",
        title: "Copy Failed",
        description: "Could not copy to clipboard",
      })
    } finally {
      setTimeout(() => setIsCopying(false), 500)
    }
  }

  const handleDownload = () => {
    setIsExporting(true)
    try {
      const blob = new Blob([markdownText], { type: 'text/markdown' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'converted.md'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      toast({
        variant: "success",
        title: "Downloaded!",
        description: "Markdown file has been downloaded",
      })
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Download Failed",
        description: "Could not download the file",
      })
    } finally {
      setTimeout(() => setIsExporting(false), 500)
    }
  }

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file && file.type === 'text/plain') {
      const reader = new FileReader()
      reader.onload = (e) => {
        const text = e.target?.result as string
        handleInputChange(text, true)
        toast({
          title: "File Loaded",
          description: `${file.name} has been loaded`,
        })
      }
      reader.readAsText(file)
    } else {
      toast({
        variant: "destructive",
        title: "Invalid File",
        description: "Please drop a .txt file",
      })
    }
  }

  const toggleAI = async (enabled: boolean) => {
    setUseAI(enabled)
    // Reprocess text if there's input
    if (inputText.trim()) {
      await handleInputChange(inputText, true)
    }
  }

  const toggleEmojis = async (enabled: boolean) => {
    setAddEmojis(enabled)
    // Reprocess text if AI is enabled and there's input
    if (useAI && inputText.trim()) {
      await handleInputChange(inputText, true)
    }
  }

  const handleReprocess = async () => {
    if (inputText.trim()) {
      await handleInputChange(inputText, true)
    }
  }

  const handleClear = () => {
    setInputText('')
    setMarkdownText('')
    setCustomInstructions('')
    localStorage.removeItem(STORAGE_KEY)
    toast({
      title: "Cleared",
      description: "All text has been cleared",
    })
  }

  const handleLLMConfigChange = (newConfig: LLMConfig) => {
    setLlmConfig(newConfig)
    // Recheck AI availability with new config
    const params = new URLSearchParams({
      provider: newConfig.provider,
      serverUrl: newConfig.serverUrl,
      selectedModel: newConfig.selectedModel,
    })

    fetch(`/api/enhance?${params}`)
      .then(res => res.json())
      .then(data => {
        setAiAvailable(data.available && data.hasModel)
        if (data.available && data.hasModel) {
          toast({
            variant: "success",
            title: "LLM Connected",
            description: newConfig.provider === 'openai'
              ? `Connected to OpenAI ${newConfig.selectedModel}`
              : `Successfully connected to ${newConfig.selectedModel}`,
          })
        }
      })
      .catch(() => setAiAvailable(false))
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4 md:px-8">
          <Logo size={28} textClassName="text-xl font-bold" />
          <div className="flex items-center gap-2">
            {/* Buy Me a Coffee - Header */}
            <BuyMeCoffee username="ybewc5qvht" variant="minimal" />

            {/* LLM Settings */}
            <LLMSettings onConfigChange={handleLLMConfigChange} />

            {/* Settings Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative transition-transform hover:scale-105 active:scale-95"
                >
                  <Settings className="h-5 w-5" />
                  {useAI && (
                    <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-primary animate-pulse"></span>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Settings</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuCheckboxItem
                  checked={useAI}
                  onCheckedChange={toggleAI}
                  disabled={!aiAvailable || isProcessing}
                >
                  <Sparkles className="mr-2 h-4 w-4" />
                  AI Enhancement
                  {!aiAvailable && (
                    <span className="ml-auto text-xs text-muted-foreground">Offline</span>
                  )}
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={addEmojis}
                  onCheckedChange={toggleEmojis}
                  disabled={!useAI || !aiAvailable || isProcessing}
                >
                  <Smile className="mr-2 h-4 w-4" />
                  Add Emojis
                  {(!useAI || !aiAvailable) && (
                    <span className="ml-auto text-xs text-muted-foreground">AI only</span>
                  )}
                </DropdownMenuCheckboxItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 md:px-8">
        {/* Desktop View */}
        <div className="hidden md:grid md:grid-cols-2 md:gap-6 md:h-[calc(100vh-18rem)]">
          {/* Input Area */}
          <div className="flex flex-col rounded-2xl border bg-card p-6 overflow-hidden">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Input Text</h2>
              <div className="flex items-center gap-2">
                {isProcessing && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader size="sm" />
                    <span>Processing...</span>
                  </div>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleReprocess}
                  disabled={!inputText.trim() || isProcessing}
                  title="Reprocess text"
                  className="transition-all hover:scale-105 active:scale-95"
                >
                  {isProcessing ? <Loader size="sm" /> : <RefreshCw className="h-4 w-4" />}
                </Button>
                {useAI && aiAvailable && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowInstructions(!showInstructions)}
                    className={`transition-all hover:scale-105 active:scale-95 ${showInstructions ? 'bg-accent' : ''}`}
                    title="Custom AI instructions"
                  >
                    <Wand2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
            {showInstructions && useAI && (
              <div className="mb-4 animate-in slide-in-from-top-2">
                <textarea
                  value={customInstructions}
                  onChange={(e) => setCustomInstructions(e.target.value)}
                  placeholder="Add custom instructions for AI processing (e.g., 'Focus on technical terms', 'Preserve all tables exactly', 'Use formal language', 'Keep table formatting intact')"
                  className="w-full h-20 rounded-lg border bg-background p-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  These instructions will guide the AI when formatting your text
                </p>
              </div>
            )}
            <div className="relative flex-1">
              <textarea
                value={inputText}
                onChange={(e) => handleInputChange(e.target.value)}
                onDrop={handleFileDrop}
                onDragOver={(e) => e.preventDefault()}
                placeholder="Paste your text here or drag and drop a .txt file..."
                className="w-full h-full resize-none rounded-lg border bg-background p-4 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary overflow-y-auto"
                disabled={isProcessing}
              />
              {inputText && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClear}
                  className="absolute bottom-2 right-2 transition-all hover:scale-105 active:scale-95 opacity-70 hover:opacity-100"
                  title="Clear all text"
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Clear
                </Button>
              )}
            </div>
          </div>

          {/* Preview Area */}
          <div className="flex flex-col rounded-2xl border bg-card p-6 overflow-hidden">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                Markdown Preview
                {useAI && aiAvailable && (
                  <span className="text-xs text-primary flex items-center gap-1 animate-in fade-in">
                    <Sparkles className="h-3 w-3" />
                    AI {addEmojis && '+ 😊'}
                  </span>
                )}
              </h2>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopy}
                  disabled={!markdownText || isProcessing}
                  className="transition-all hover:scale-105 active:scale-95"
                >
                  {isCopying ? (
                    <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="mr-2 h-4 w-4" />
                  )}
                  Copy
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownload}
                  disabled={!markdownText || isProcessing}
                  className="transition-all hover:scale-105 active:scale-95"
                >
                  {isExporting ? (
                    <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                  ) : (
                    <Download className="mr-2 h-4 w-4" />
                  )}
                  Export
                </Button>
              </div>
            </div>
            <div className="flex-1 overflow-auto rounded-lg border bg-background p-4">
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {markdownText || '*Your converted Markdown will appear here...*'}
                </ReactMarkdown>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile View */}
        <div className="md:hidden">
          <Tabs defaultValue="input" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="input">Input</TabsTrigger>
              <TabsTrigger value="preview">Preview</TabsTrigger>
            </TabsList>

            <TabsContent value="input" className="mt-4">
              <div className="flex flex-col rounded-2xl border bg-card p-4 h-[calc(100vh-14rem)]">
                <div className="mb-2 flex items-center justify-between">
                  {isProcessing && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Loader size="sm" />
                      <span>Processing...</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 ml-auto">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleReprocess}
                      disabled={!inputText.trim() || isProcessing}
                      title="Reprocess text"
                    >
                      {isProcessing ? <Loader size="sm" /> : <RefreshCw className="h-4 w-4" />}
                    </Button>
                    {useAI && aiAvailable && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowInstructions(!showInstructions)}
                        className={showInstructions ? 'bg-accent' : ''}
                        title="Custom AI instructions"
                      >
                        <Wand2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
                {showInstructions && useAI && (
                  <div className="mb-2 animate-in slide-in-from-top-2">
                    <textarea
                      value={customInstructions}
                      onChange={(e) => setCustomInstructions(e.target.value)}
                      placeholder="Add custom instructions for AI processing..."
                      className="w-full h-16 rounded-lg border bg-background p-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                    />
                  </div>
                )}
                <div className="relative flex-1">
                  <textarea
                    value={inputText}
                    onChange={(e) => handleInputChange(e.target.value)}
                    onDrop={handleFileDrop}
                    onDragOver={(e) => e.preventDefault()}
                    placeholder="Paste your text here or drag and drop a .txt file..."
                    className="w-full h-full resize-none rounded-lg border bg-background p-4 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    disabled={isProcessing}
                  />
                  {inputText && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleClear}
                      className="absolute bottom-2 right-2 opacity-70 hover:opacity-100"
                      title="Clear all text"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="preview" className="mt-4">
              <div className="flex flex-col rounded-2xl border bg-card p-4 h-[calc(100vh-14rem)]">
                <div className="mb-4 flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopy}
                    disabled={!markdownText || isProcessing}
                    className="flex-1"
                  >
                    {isCopying ? (
                      <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="mr-2 h-4 w-4" />
                    )}
                    Copy
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDownload}
                    disabled={!markdownText || isProcessing}
                    className="flex-1"
                  >
                    {isExporting ? (
                      <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                    ) : (
                      <Download className="mr-2 h-4 w-4" />
                    )}
                    Export
                  </Button>
                </div>
                <div className="flex-1 overflow-auto rounded-lg border bg-background p-4">
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {markdownText || '*Your converted Markdown will appear here...*'}
                    </ReactMarkdown>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Features Gallery */}
        <FeaturesGallery
          aiAvailable={aiAvailable}
          useAI={useAI}
          addEmojis={addEmojis}
        />

        {/* Support Section */}
        <div className="mt-12 text-center">
          <div className="inline-flex flex-col items-center gap-4 p-6 rounded-2xl border bg-card">
            <div className="text-sm text-muted-foreground">
              Enjoying Paste2MD? Support the development!
            </div>
            <BuyMeCoffee username="ybewc5qvht" />
            <div className="text-xs text-muted-foreground max-w-md">
              Your support helps keep this tool free and enables new features like better AI models and cloud sync.
            </div>
          </div>
        </div>
      </main>

      {/* Floating Buy Me a Coffee - shows on mobile */}
      <div className="md:hidden">
        <BuyMeCoffee username="ybewc5qvht" variant="floating" />
      </div>
    </div>
  )
}