export type Theme = 'light' | 'dark' | 'system'

export interface ThemeConfig {
    defaultTheme: Theme
    enableSystem: boolean
    disableTransitionOnChange: boolean
    themes: string[]
    storageKey: string
}

export const themeConfig: ThemeConfig = {
    defaultTheme: 'system',
    enableSystem: true,
    disableTransitionOnChange: false,
    themes: ['light', 'dark'],
    storageKey: 'paste2md-theme',
}

// Theme validation utility
export const isValidTheme = (theme: string): theme is Theme => {
    return ['light', 'dark', 'system'].includes(theme)
}

// Get theme preference with fallback
export const getThemePreference = (): Theme => {
    if (typeof window === 'undefined') return themeConfig.defaultTheme

    try {
        const stored = localStorage.getItem(themeConfig.storageKey)
        if (stored && isValidTheme(stored)) {
            return stored
        }
    } catch (error) {
        console.warn('Failed to read theme preference:', error)
    }

    return themeConfig.defaultTheme
}