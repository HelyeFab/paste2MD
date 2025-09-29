'use client'

import { Moon, Sun, Monitor, Palette, Check } from 'lucide-react'
import { useTheme } from 'next-themes'
import { Button } from './ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from './ui/dropdown-menu'
import { useEffect, useState } from 'react'
import { CUSTOM_THEME_COLORS } from '@/lib/theme-colors'
import { useCustomTheme } from '@/hooks/use-custom-theme'

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const { selectedColorId, setCustomColor, mounted } = useCustomTheme()

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" disabled>
        <Sun className="h-4 w-4" />
        <span className="sr-only">Toggle theme</span>
      </Button>
    )
  }

  const handleColorSelect = (colorId: string) => {
    setCustomColor(colorId)
  }

  const getIcon = () => {
    if (theme === 'system') {
      return <Monitor className="h-4 w-4" />
    }
    return resolvedTheme === 'dark' ? (
      <Moon className="h-4 w-4" />
    ) : (
      <Sun className="h-4 w-4" />
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" suppressHydrationWarning>
          {getIcon()}
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80" suppressHydrationWarning>
        <DropdownMenuLabel>Theme Mode</DropdownMenuLabel>
        <DropdownMenuItem onClick={() => setTheme('light')}>
          <Sun className="mr-2 h-4 w-4" />
          <span>Light</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('dark')}>
          <Moon className="mr-2 h-4 w-4" />
          <span>Dark</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('system')}>
          <Monitor className="mr-2 h-4 w-4" />
          <span>System</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuLabel className="flex items-center gap-2">
          <Palette className="h-4 w-4" />
          Dark Theme Colors
        </DropdownMenuLabel>

        {/* Default Option */}
        <DropdownMenuItem
          onClick={() => handleColorSelect('default')}
          className="flex items-center justify-between p-3"
        >
          <div className="flex items-center gap-3">
            <div
              className="w-6 h-6 rounded-full border-2 border-border"
              style={{ backgroundColor: 'hsl(222.2 84% 4.9%)' }}
            />
            <div>
              <div className="font-medium">Default</div>
              <div className="text-xs text-muted-foreground">Original dark theme</div>
            </div>
          </div>
          {selectedColorId === 'default' && (
            <Check className="h-4 w-4 text-primary" />
          )}
        </DropdownMenuItem>

        {/* Custom Color Options */}
        {CUSTOM_THEME_COLORS.map((color) => (
          <DropdownMenuItem
            key={color.id}
            onClick={() => handleColorSelect(color.id)}
            className="flex items-center justify-between p-3"
          >
            <div className="flex items-center gap-3">
              <div
                className="w-6 h-6 rounded-full border-2 border-border shadow-sm"
                style={{ backgroundColor: color.hex }}
              />
              <div>
                <div className="font-medium">{color.name}</div>
                <div className="text-xs text-muted-foreground">{color.preview}</div>
              </div>
            </div>
            {selectedColorId === color.id && (
              <Check className="h-4 w-4 text-primary" />
            )}
          </DropdownMenuItem>
        ))}

        <DropdownMenuSeparator />

        <div className="p-2 text-xs text-muted-foreground text-center">
          Custom colors only apply to dark theme
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}