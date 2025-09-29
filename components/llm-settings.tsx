'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { toast } from '@/hooks/use-toast'
import { Loader } from '@/components/ui/loader'
import {
    Settings,
    Server,
    Brain,
    CheckCircle,
    XCircle,
    RefreshCw,
    Zap,
    Clock,
    HardDrive,
    Calendar,
    AlertTriangle,
    Cloud,
    Home,
} from 'lucide-react'
import {
    type LLMConfig,
    type LLMModel,
    type LLMProvider,
    getLLMConfig,
    saveLLMConfig,
    isValidServerUrl,
    getBestAvailableModel,
    cacheModels,
    getCachedModels,
    DEFAULT_LLM_CONFIG,
    OPENAI_MODELS,
} from '@/lib/llm-config'

interface LLMSettingsProps {
    onConfigChange?: (config: LLMConfig) => void
}

export function LLMSettings({ onConfigChange }: LLMSettingsProps) {
    const [open, setOpen] = useState(false)
    const [config, setConfig] = useState<LLMConfig>(DEFAULT_LLM_CONFIG)
    const [models, setModels] = useState<LLMModel[]>([])
    const [isTestingConnection, setIsTestingConnection] = useState(false)
    const [isFetchingModels, setIsFetchingModels] = useState(false)
    const [connectionStatus, setConnectionStatus] = useState<'idle' | 'success' | 'error'>('idle')
    const [connectionError, setConnectionError] = useState<string>('')
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

    // Load config on mount
    useEffect(() => {
        const savedConfig = getLLMConfig()
        setConfig(savedConfig)

        // Try to load cached models
        const cached = getCachedModels()
        if (cached) {
            setModels(cached)
        }
    }, [])

    // Test connection to LLM server
    const testConnection = async (serverUrl?: string) => {
        const urlToTest = serverUrl || config.serverUrl

        // For OpenAI, skip URL validation
        if (config.provider !== 'openai' && !isValidServerUrl(urlToTest)) {
            setConnectionStatus('error')
            setConnectionError('Invalid server URL format')
            return false
        }

        setIsTestingConnection(true)
        setConnectionStatus('idle')
        setConnectionError('')

        try {
            const response = await fetch('/api/llm-config', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    provider: config.provider,
                    serverUrl: config.provider === 'local' ? urlToTest : undefined,
                    action: 'test-connection',
                }),
            })

            const data = await response.json()

            if (data.success) {
                setConnectionStatus('success')
                setModels(data.models || [])
                cacheModels(data.models || [])

                // Auto-select best available model if current model isn't available
                const modelNames = data.models?.map((m: LLMModel) => m.name) || []
                if (!modelNames.includes(config.selectedModel)) {
                    const bestModel = getBestAvailableModel(modelNames, config.provider)
                    setConfig(prev => ({ ...prev, selectedModel: bestModel }))
                    setHasUnsavedChanges(true)
                }

                toast({
                    variant: "success",
                    title: "Connection Successful",
                    description: config.provider === 'openai'
                        ? 'Connected to OpenAI API'
                        : `Found ${data.models?.length || 0} models on server`,
                })
                return true
            } else {
                setConnectionStatus('error')
                setConnectionError(data.error || 'Connection failed')
                toast({
                    variant: "destructive",
                    title: "Connection Failed",
                    description: data.error || 'Could not connect to server',
                })
                return false
            }
        } catch (error) {
            setConnectionStatus('error')
            setConnectionError('Network error')
            toast({
                variant: "destructive",
                title: "Connection Error",
                description: 'Network error occurred',
            })
            return false
        } finally {
            setIsTestingConnection(false)
        }
    }

    // Fetch models from server
    const fetchModels = async () => {
        if (config.provider === 'local' && !isValidServerUrl(config.serverUrl)) {
            toast({
                variant: "destructive",
                title: "Invalid URL",
                description: "Please enter a valid server URL first",
            })
            return
        }

        setIsFetchingModels(true)

        try {
            const response = await fetch('/api/llm-config', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    provider: config.provider,
                    serverUrl: config.provider === 'local' ? config.serverUrl : undefined,
                    action: 'get-models',
                }),
            })

            const data = await response.json()

            if (data.success) {
                setModels(data.models || [])
                cacheModels(data.models || [])
                toast({
                    variant: "success",
                    title: "Models Updated",
                    description: `Found ${data.models?.length || 0} models`,
                })
            } else {
                toast({
                    variant: "destructive",
                    title: "Failed to Fetch Models",
                    description: data.error || 'Could not fetch models',
                })
            }
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Network Error",
                description: 'Could not fetch models',
            })
        } finally {
            setIsFetchingModels(false)
        }
    }

    // Save configuration
    const saveConfig = () => {
        saveLLMConfig(config)
        setHasUnsavedChanges(false)
        onConfigChange?.(config)
        toast({
            variant: "success",
            title: "Settings Saved",
            description: "LLM configuration has been saved",
        })
    }

    // Reset to defaults
    const resetToDefaults = () => {
        setConfig(DEFAULT_LLM_CONFIG)
        setHasUnsavedChanges(true)
        setConnectionStatus('idle')
        setConnectionError('')
    }

    // Update config and mark as changed
    const updateConfig = (updates: Partial<LLMConfig>) => {
        setConfig(prev => ({ ...prev, ...updates }))
        setHasUnsavedChanges(true)
    }

    // Format model size
    const formatModelSize = (size?: string) => {
        if (!size) return ''
        const bytes = parseInt(size)
        if (bytes > 1e9) return `${(bytes / 1e9).toFixed(1)}GB`
        if (bytes > 1e6) return `${(bytes / 1e6).toFixed(1)}MB`
        return size
    }

    // Format date
    const formatDate = (dateStr?: string) => {
        if (!dateStr) return ''
        return new Date(dateStr).toLocaleDateString()
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="icon" title="LLM Settings">
                    <Brain className="h-5 w-5" />
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Brain className="h-5 w-5" />
                        LLM Configuration
                    </DialogTitle>
                    <DialogDescription>
                        Configure your LLM provider and connection settings
                    </DialogDescription>
                </DialogHeader>

                <Tabs defaultValue="connection" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="connection">Connection</TabsTrigger>
                        <TabsTrigger value="models">Models</TabsTrigger>
                        <TabsTrigger value="advanced">Advanced</TabsTrigger>
                    </TabsList>

                    <TabsContent value="connection" className="space-y-4">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="provider">Provider</Label>
                                <Select
                                    value={config.provider}
                                    onValueChange={(value: LLMProvider) => {
                                        updateConfig({
                                            provider: value,
                                            selectedModel: value === 'openai' ? 'gpt-4o-mini' : 'llama3.1:8b'
                                        })
                                        setConnectionStatus('idle')
                                        setConnectionError('')
                                    }}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select provider" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="local">
                                            <div className="flex items-center gap-2">
                                                <Home className="h-4 w-4" />
                                                <div>
                                                    <div className="font-medium">Local (Ollama)</div>
                                                    <div className="text-xs text-muted-foreground">Run models on your computer</div>
                                                </div>
                                            </div>
                                        </SelectItem>
                                        <SelectItem value="openai">
                                            <div className="flex items-center gap-2">
                                                <Cloud className="h-4 w-4" />
                                                <div>
                                                    <div className="font-medium">OpenAI</div>
                                                    <div className="text-xs text-muted-foreground">Use GPT-4o Mini or GPT-4o</div>
                                                </div>
                                            </div>
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                                <p className="text-xs text-muted-foreground">
                                    {config.provider === 'openai'
                                        ? 'Uses OpenAI API (requires API key in .env.local)'
                                        : 'Connect to your local Ollama server'}
                                </p>
                            </div>

                            {config.provider === 'local' && (
                                <div className="space-y-2">
                                    <Label htmlFor="serverUrl">Server URL</Label>
                                    <div className="flex gap-2">
                                        <Input
                                            id="serverUrl"
                                            value={config.serverUrl}
                                            onChange={(e) => updateConfig({ serverUrl: e.target.value })}
                                            placeholder="http://localhost:11434"
                                            className="flex-1"
                                        />
                                        <Button
                                            onClick={() => testConnection()}
                                            disabled={isTestingConnection}
                                            variant="outline"
                                        >
                                            {isTestingConnection ? (
                                                <Loader size="sm" />
                                            ) : (
                                                <Server className="h-4 w-4" />
                                            )}
                                            Test
                                        </Button>
                                    </div>
                                    {connectionStatus === 'success' && (
                                        <div className="flex items-center gap-2 text-sm text-green-600">
                                            <CheckCircle className="h-4 w-4" />
                                            Connection successful
                                        </div>
                                    )}
                                    {connectionStatus === 'error' && (
                                        <div className="flex items-center gap-2 text-sm text-red-600">
                                            <XCircle className="h-4 w-4" />
                                            {connectionError}
                                        </div>
                                    )}
                                </div>
                            )}

                            {config.provider === 'openai' && (
                                <div className="space-y-2">
                                    <Label>OpenAI Connection</Label>
                                    <Button
                                        onClick={() => testConnection()}
                                        disabled={isTestingConnection}
                                        variant="outline"
                                        className="w-full"
                                    >
                                        {isTestingConnection ? (
                                            <Loader size="sm" />
                                        ) : (
                                            <Cloud className="h-4 w-4 mr-2" />
                                        )}
                                        Test OpenAI Connection
                                    </Button>
                                    {connectionStatus === 'success' && (
                                        <div className="flex items-center gap-2 text-sm text-green-600">
                                            <CheckCircle className="h-4 w-4" />
                                            Connected to OpenAI API
                                        </div>
                                    )}
                                    {connectionStatus === 'error' && (
                                        <div className="flex items-center gap-2 text-sm text-red-600">
                                            <XCircle className="h-4 w-4" />
                                            {connectionError}
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className="space-y-2">
                                <Label htmlFor="timeout">Connection Timeout (ms)</Label>
                                <Input
                                    id="timeout"
                                    type="number"
                                    value={config.timeout}
                                    onChange={(e) => updateConfig({ timeout: parseInt(e.target.value) || 30000 })}
                                    min="5000"
                                    max="120000"
                                    step="1000"
                                />
                                <p className="text-xs text-muted-foreground">
                                    How long to wait for responses (5-120 seconds)
                                </p>
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="models" className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-medium">Available Models</h3>
                            <Button
                                onClick={fetchModels}
                                disabled={isFetchingModels}
                                variant="outline"
                                size="sm"
                            >
                                {isFetchingModels ? (
                                    <Loader size="sm" />
                                ) : (
                                    <RefreshCw className="h-4 w-4" />
                                )}
                                Refresh
                            </Button>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="selectedModel">Selected Model</Label>
                            <Select
                                value={config.selectedModel}
                                onValueChange={(value) => updateConfig({ selectedModel: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a model" />
                                </SelectTrigger>
                                <SelectContent>
                                    {models.map((model) => (
                                        <SelectItem key={model.name} value={model.name}>
                                            <div className="flex items-center justify-between w-full">
                                                <span>{model.name}</span>
                                                {model.size && (
                                                    <Badge variant="secondary" className="ml-2">
                                                        {formatModelSize(model.size)}
                                                    </Badge>
                                                )}
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {models.length > 0 && (
                            <div className="space-y-2">
                                <h4 className="font-medium">Model Details</h4>
                                <div className="grid gap-2 max-h-60 overflow-y-auto">
                                    {models.map((model) => (
                                        <div
                                            key={model.name}
                                            className={`p-3 rounded-lg border ${model.name === config.selectedModel
                                                    ? 'border-primary bg-primary/5'
                                                    : 'border-border'
                                                }`}
                                        >
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="font-medium">{model.name}</span>
                                                <div className="flex gap-2">
                                                    {model.size && (
                                                        <Badge variant="outline">
                                                            <HardDrive className="h-3 w-3 mr-1" />
                                                            {formatModelSize(model.size)}
                                                        </Badge>
                                                    )}
                                                    {model.modified_at && (
                                                        <Badge variant="outline">
                                                            <Calendar className="h-3 w-3 mr-1" />
                                                            {formatDate(model.modified_at)}
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>
                                            {model.details && (
                                                <div className="text-xs text-muted-foreground">
                                                    {model.details.family && (
                                                        <span>Family: {model.details.family} • </span>
                                                    )}
                                                    {model.details.parameter_size && (
                                                        <span>Parameters: {model.details.parameter_size} • </span>
                                                    )}
                                                    {model.details.quantization_level && (
                                                        <span>Quantization: {model.details.quantization_level}</span>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {models.length === 0 && (
                            <div className="text-center py-8 text-muted-foreground">
                                <AlertTriangle className="h-8 w-8 mx-auto mb-2" />
                                <p>No models found. Test your connection first.</p>
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="advanced" className="space-y-4">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label>Temperature: {config.temperature}</Label>
                                <Slider
                                    value={[config.temperature]}
                                    onValueChange={([value]) => updateConfig({ temperature: value })}
                                    min={0}
                                    max={1}
                                    step={0.1}
                                    className="w-full"
                                />
                                <p className="text-xs text-muted-foreground">
                                    Lower values make output more focused and deterministic
                                </p>
                            </div>

                            <div className="space-y-2">
                                <Label>Top P: {config.topP}</Label>
                                <Slider
                                    value={[config.topP]}
                                    onValueChange={([value]) => updateConfig({ topP: value })}
                                    min={0}
                                    max={1}
                                    step={0.1}
                                    className="w-full"
                                />
                                <p className="text-xs text-muted-foreground">
                                    Controls diversity of output by limiting token choices
                                </p>
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>

                <div className="flex items-center justify-between pt-4 border-t">
                    <Button
                        onClick={resetToDefaults}
                        variant="outline"
                    >
                        Reset to Defaults
                    </Button>
                    <div className="flex gap-2">
                        <Button
                            onClick={() => setOpen(false)}
                            variant="outline"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={saveConfig}
                            disabled={!hasUnsavedChanges}
                        >
                            {hasUnsavedChanges && <Zap className="h-4 w-4 mr-2" />}
                            Save Settings
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}