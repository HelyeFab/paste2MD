'use client'

import { useTheme as useNextTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import { type Theme, isValidTheme, getThemePreference } from '@/lib/theme-config'

export function useTheme() {
    const { theme, setTheme, resolvedTheme, systemTheme } = useNextTheme()
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    const safeSetTheme = (newTheme: Theme) => {
        if (isValidTheme(newTheme)) {
            setTheme(newTheme)
        } else {
            console.warn(`Invalid theme: ${newTheme}. Using default theme.`)
            setTheme(getThemePreference())
        }
    }

    const toggleTheme = () => {
        const currentTheme = resolvedTheme || 'light'
        safeSetTheme(currentTheme === 'dark' ? 'light' : 'dark')
    }

    const isDark = mounted ? resolvedTheme === 'dark' : false
    const isLight = mounted ? resolvedTheme === 'light' : false
    const isSystem = mounted ? theme === 'system' : false

    return {
        theme: theme as Theme,
        resolvedTheme: resolvedTheme as 'light' | 'dark',
        systemTheme: systemTheme as 'light' | 'dark',
        setTheme: safeSetTheme,
        toggleTheme,
        mounted,
        isDark,
        isLight,
        isSystem,
    }
}