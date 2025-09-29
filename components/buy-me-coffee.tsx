'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Coffee, Heart, ExternalLink } from 'lucide-react'
import { cn } from '@/lib/utils'

interface BuyMeCoffeeProps {
    username: string
    variant?: 'default' | 'minimal' | 'floating'
    className?: string
}

export function BuyMeCoffee({
    username,
    variant = 'default',
    className
}: BuyMeCoffeeProps) {
    const [isHovered, setIsHovered] = useState(false)

    const buyMeCoffeeUrl = `https://buymeacoffee.com/${username}`

    const handleClick = () => {
        window.open(buyMeCoffeeUrl, '_blank', 'noopener,noreferrer')
    }

    if (variant === 'minimal') {
        return (
            <Button
                onClick={handleClick}
                variant="ghost"
                size="sm"
                className={cn(
                    "text-yellow-600 hover:text-yellow-500 dark:text-yellow-500 dark:hover:text-yellow-400 transition-colors",
                    className
                )}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                <Coffee className={cn(
                    "h-4 w-4 mr-2 transition-transform",
                    isHovered && "scale-110"
                )} />
                Support
                <ExternalLink className="h-3 w-3 ml-1 opacity-50" />
            </Button>
        )
    }

    if (variant === 'floating') {
        return (
            <div className={cn(
                "fixed bottom-6 right-6 z-50",
                className
            )}>
                <Button
                    onClick={handleClick}
                    className={cn(
                        "rounded-full shadow-lg hover:shadow-xl transition-all duration-300",
                        "bg-[#FFDD00] hover:bg-[#FFDD00]/90 text-black",
                        "border-2 border-black/10",
                        isHovered && "scale-110"
                    )}
                    size="lg"
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                >
                    <Coffee className="h-5 w-5 mr-2" />
                    Buy me a coffee
                    <Heart className={cn(
                        "h-4 w-4 ml-2 transition-all",
                        isHovered ? "text-red-500 scale-125" : "text-black/70"
                    )} />
                </Button>
            </div>
        )
    }

    // Default variant
    return (
        <Button
            onClick={handleClick}
            className={cn(
                "bg-[#FFDD00] hover:bg-[#FFDD00]/90 text-black font-medium",
                "border border-black/10 shadow-sm hover:shadow-md transition-all duration-200",
                "group",
                className
            )}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <Coffee className={cn(
                "h-4 w-4 mr-2 transition-transform",
                isHovered && "scale-110"
            )} />
            Buy me a coffee
            <Heart className={cn(
                "h-4 w-4 ml-2 transition-all",
                isHovered ? "text-red-500 scale-125" : "text-black/70"
            )} />
            <ExternalLink className="h-3 w-3 ml-1 opacity-50 group-hover:opacity-70" />
        </Button>
    )
}