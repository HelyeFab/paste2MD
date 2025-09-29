'use client'

import { useState, useEffect } from 'react'
import { useTheme } from 'next-themes'
import {
    getCustomThemeConfig,
    applyCustomTheme,
    type CustomThemeConfig
} from '@/lib/theme-colors'

export function useCustomTheme() {
    const { resolvedTheme } = useTheme()
    const [config, setConfig] = useState<CustomThemeConfig>({ selectedColorId: 'default' })
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)

        // Only run on client side to prevent hydration mismatch
        if (typeof window === 'undefined') return

        const savedConfig = getCustomThemeConfig()
        setConfig(savedConfig)

        // Apply custom theme if one is selected and we're in dark mode
        if (savedConfig.selectedColorId !== 'default') {
            // Small delay to ensure DOM is ready
            setTimeout(() => {
                applyCustomTheme(savedConfig.selectedColorId)
            }, 0)
        }
    }, [])

    // Apply/remove custom theme when theme mode changes
    useEffect(() => {
        if (!mounted || typeof window === 'undefined') return

        if (resolvedTheme === 'dark' && config.selectedColorId !== 'default') {
            applyCustomTheme(config.selectedColorId)
        } else if (resolvedTheme !== 'dark') {
            // Remove custom theme when not in dark mode
            if (typeof document !== 'undefined') {
                document.documentElement.classList.remove('custom-theme')
            }
        }
    }, [resolvedTheme, config.selectedColorId, mounted])

    const setCustomColor = (colorId: string) => {
        if (!mounted || typeof window === 'undefined') return

        const newConfig = { selectedColorId: colorId }
        setConfig(newConfig)

        if (resolvedTheme === 'dark') {
            applyCustomTheme(colorId)
        }
    }

    return {
        selectedColorId: mounted ? config.selectedColorId : 'default',
        setCustomColor,
        mounted,
    }
}