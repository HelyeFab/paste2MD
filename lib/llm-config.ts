export type LLMProvider = 'local' | 'openai'

export interface LLMConfig {
    provider: LLMProvider
    serverUrl: string
    selectedModel: string
    temperature: number
    topP: number
    timeout: number
}

export interface LLMModel {
    name: string
    size?: string
    modified_at?: string
    digest?: string
    details?: {
        format?: string
        family?: string
        families?: string[]
        parameter_size?: string
        quantization_level?: string
    }
}

export const DEFAULT_LLM_CONFIG: LLMConfig = {
    provider: typeof window !== 'undefined' && window.location.hostname === 'localhost' ? 'local' : 'openai',
    serverUrl: 'http://localhost:11434',
    selectedModel: typeof window !== 'undefined' && window.location.hostname === 'localhost' ? 'llama3.1:8b' : 'gpt-4o-mini',
    temperature: 0.3,
    topP: 0.9,
    timeout: 30000, // 30 seconds
}

export const STORAGE_KEYS = {
    LLM_CONFIG: 'paste2md-llm-config',
    LAST_MODELS_CHECK: 'paste2md-last-models-check',
    CACHED_MODELS: 'paste2md-cached-models',
} as const

// Supported local models (fallback priority order)
export const SUPPORTED_LOCAL_MODELS = [
    'llama3.1:8b',
    'llama3.1:latest',
    'llama3:8b',
    'llama3:latest',
    'phi4:latest',
    'phi4',
    'devstral:latest',
    'devstral',
    'qwen2.5:7b',
    'qwen2.5:latest',
    'mistral:7b',
    'mistral:latest',
] as const

// Supported OpenAI models
export const OPENAI_MODELS = [
    { name: 'gpt-4o-mini', displayName: 'GPT-4o Mini', description: 'Fast and affordable' },
    { name: 'gpt-4o', displayName: 'GPT-4o', description: 'Most capable model' },
    { name: 'gpt-3.5-turbo', displayName: 'GPT-3.5 Turbo', description: 'Legacy model' },
] as const

// Get LLM config from localStorage with fallback to defaults
export function getLLMConfig(): LLMConfig {
    if (typeof window === 'undefined') return DEFAULT_LLM_CONFIG

    try {
        const stored = localStorage.getItem(STORAGE_KEYS.LLM_CONFIG)
        if (stored) {
            const parsed = JSON.parse(stored)
            return { ...DEFAULT_LLM_CONFIG, ...parsed }
        }
    } catch (error) {
        console.warn('Failed to load LLM config:', error)
    }

    return DEFAULT_LLM_CONFIG
}

// Save LLM config to localStorage
export function saveLLMConfig(config: Partial<LLMConfig>): void {
    if (typeof window === 'undefined') return

    try {
        const currentConfig = getLLMConfig()
        const newConfig = { ...currentConfig, ...config }
        localStorage.setItem(STORAGE_KEYS.LLM_CONFIG, JSON.stringify(newConfig))
    } catch (error) {
        console.error('Failed to save LLM config:', error)
    }
}

// Validate server URL format
export function isValidServerUrl(url: string): boolean {
    try {
        const parsed = new URL(url)
        return ['http:', 'https:'].includes(parsed.protocol)
    } catch {
        return false
    }
}

// Get the best available model from a list
export function getBestAvailableModel(availableModels: string[], provider: LLMProvider = 'local'): string {
    if (provider === 'openai') {
        // For OpenAI, prefer gpt-4o-mini as default
        return availableModels.includes('gpt-4o-mini') ? 'gpt-4o-mini' : availableModels[0] || 'gpt-4o-mini'
    }

    // For local models
    for (const supportedModel of SUPPORTED_LOCAL_MODELS) {
        const found = availableModels.find(model =>
            model.toLowerCase().includes(supportedModel.toLowerCase()) ||
            model === supportedModel
        )
        if (found) return found
    }

    // If no supported model found, return the first available or default
    return availableModels[0] || DEFAULT_LLM_CONFIG.selectedModel
}

// Cache models with timestamp
export function cacheModels(models: LLMModel[]): void {
    if (typeof window === 'undefined') return

    try {
        localStorage.setItem(STORAGE_KEYS.CACHED_MODELS, JSON.stringify(models))
        localStorage.setItem(STORAGE_KEYS.LAST_MODELS_CHECK, Date.now().toString())
    } catch (error) {
        console.error('Failed to cache models:', error)
    }
}

// Get cached models if they're recent (within 5 minutes)
export function getCachedModels(): LLMModel[] | null {
    if (typeof window === 'undefined') return null

    try {
        const lastCheck = localStorage.getItem(STORAGE_KEYS.LAST_MODELS_CHECK)
        const cached = localStorage.getItem(STORAGE_KEYS.CACHED_MODELS)

        if (!lastCheck || !cached) return null

        const fiveMinutesAgo = Date.now() - (5 * 60 * 1000)
        if (parseInt(lastCheck) < fiveMinutesAgo) return null

        return JSON.parse(cached)
    } catch (error) {
        console.warn('Failed to get cached models:', error)
        return null
    }
}