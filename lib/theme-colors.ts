export interface CustomThemeColor {
    id: string
    name: string
    hex: string
    hsl: string
    preview: string
}

export const CUSTOM_THEME_COLORS: CustomThemeColor[] = [
    {
        id: 'purple-slate',
        name: 'Purple Slate',
        hex: '#373054',
        hsl: '252 21% 26%',
        preview: 'A sophisticated purple-gray blend'
    },
    {
        id: 'blue-gray',
        name: 'Blue Gray',
        hex: '#9dabcf',
        hsl: '225 35% 71%',
        preview: 'Soft blue-gray for calm focus'
    },
    {
        id: 'forest-teal',
        name: 'Forest Teal',
        hex: '#334b49',
        hsl: '174 18% 25%',
        preview: 'Deep forest green with teal hints'
    },
    {
        id: 'ocean-blue',
        name: 'Ocean Blue',
        hex: '#0c5068',
        hsl: '194 69% 23%',
        preview: 'Deep ocean blue for concentration'
    },
    {
        id: 'slate-blue',
        name: 'Slate Blue',
        hex: '#384765',
        hsl: '218 26% 32%',
        preview: 'Professional slate with blue undertones'
    },
    {
        id: 'teal-dark',
        name: 'Dark Teal',
        hex: '#006a75',
        hsl: '185 100% 23%',
        preview: 'Rich teal for creative work'
    },
    {
        id: 'emerald',
        name: 'Emerald',
        hex: '#009e83',
        hsl: '169 100% 31%',
        preview: 'Vibrant emerald green'
    },
    {
        id: 'lavender-gray',
        name: 'Lavender Gray',
        hex: '#816e88',
        hsl: '285 12% 48%',
        preview: 'Elegant lavender with gray balance'
    }
]

export const STORAGE_KEY = 'paste2md-custom-theme'

export interface CustomThemeConfig {
    selectedColorId: string
    customBackground?: string
}

export function getCustomThemeConfig(): CustomThemeConfig {
    if (typeof window === 'undefined') {
        return { selectedColorId: 'default' }
    }

    try {
        const stored = localStorage.getItem(STORAGE_KEY)
        if (stored) {
            return JSON.parse(stored)
        }
    } catch (error) {
        console.warn('Failed to load custom theme config:', error)
    }

    return { selectedColorId: 'default' }
}

export function saveCustomThemeConfig(config: CustomThemeConfig): void {
    if (typeof window === 'undefined') return

    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(config))
    } catch (error) {
        console.error('Failed to save custom theme config:', error)
    }
}

export function applyCustomTheme(colorId: string): void {
    // Ensure we're on the client side
    if (typeof document === 'undefined' || typeof window === 'undefined') return

    const color = CUSTOM_THEME_COLORS.find(c => c.id === colorId)
    if (!color) {
        // Reset to default
        try {
            document.documentElement.style.removeProperty('--custom-background')
            document.documentElement.classList.remove('custom-theme')
        } catch (error) {
            console.warn('Failed to reset custom theme:', error)
        }
        return
    }

    try {
        // Apply custom background color
        document.documentElement.style.setProperty('--custom-background', color.hsl)
        document.documentElement.classList.add('custom-theme')

        // Save the selection
        saveCustomThemeConfig({ selectedColorId: colorId })
    } catch (error) {
        console.warn('Failed to apply custom theme:', error)
    }
}

// Convert hex to HSL
export function hexToHsl(hex: string): string {
    const r = parseInt(hex.slice(1, 3), 16) / 255
    const g = parseInt(hex.slice(3, 5), 16) / 255
    const b = parseInt(hex.slice(5, 7), 16) / 255

    const max = Math.max(r, g, b)
    const min = Math.min(r, g, b)
    let h = 0
    let s = 0
    const l = (max + min) / 2

    if (max !== min) {
        const d = max - min
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min)

        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break
            case g: h = (b - r) / d + 2; break
            case b: h = (r - g) / d + 4; break
        }
        h /= 6
    }

    return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`
}