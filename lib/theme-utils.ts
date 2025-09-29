import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

// Theme-aware class utilities
export const themeClasses = {
    // Card variants
    card: {
        default: 'bg-card text-card-foreground border border-border',
        elevated: 'bg-card text-card-foreground border border-border shadow-lg',
        ghost: 'bg-transparent text-foreground',
    },

    // Button variants with theme awareness
    button: {
        primary: 'bg-primary text-primary-foreground hover:bg-primary/90',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
    },

    // Input variants
    input: {
        default: 'bg-background border-input text-foreground placeholder:text-muted-foreground',
        error: 'bg-background border-destructive text-foreground placeholder:text-muted-foreground',
    },

    // Text variants
    text: {
        primary: 'text-foreground',
        secondary: 'text-muted-foreground',
        accent: 'text-accent-foreground',
        destructive: 'text-destructive',
    },
} as const

// Helper to get theme-aware classes
export function getThemeClass(
    component: keyof typeof themeClasses,
    variant: string,
    additionalClasses?: string
) {
    const baseClasses = themeClasses[component]?.[variant as keyof typeof themeClasses[typeof component]]
    return cn(baseClasses, additionalClasses)
}

// Color scheme detection utilities
export function getSystemTheme(): 'light' | 'dark' {
    if (typeof window === 'undefined') return 'light'

    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function watchSystemTheme(callback: (theme: 'light' | 'dark') => void) {
    if (typeof window === 'undefined') return () => { }

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

    const handler = (e: MediaQueryListEvent) => {
        callback(e.matches ? 'dark' : 'light')
    }

    mediaQuery.addEventListener('change', handler)

    return () => mediaQuery.removeEventListener('change', handler)
}