'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Feature {
    emoji: string
    title: string
    description: string
    gradient: string
}

interface FeaturesGalleryProps {
    aiAvailable?: boolean
    useAI?: boolean
    addEmojis?: boolean
}

export function FeaturesGallery({ aiAvailable, useAI, addEmojis }: FeaturesGalleryProps) {
    const [currentIndex, setCurrentIndex] = useState(0)
    const [isAutoPlaying, setIsAutoPlaying] = useState(true)

    // Base features that are always available
    const baseFeatures: Feature[] = [
        {
            emoji: '📝',
            title: 'Smart Headers',
            description: 'Automatically detects and formats headers and sections with proper hierarchy',
            gradient: 'from-blue-500/20 to-purple-500/20'
        },
        {
            emoji: '📊',
            title: 'Table Preservation',
            description: 'Preserves complex tables with proper markdown formatting and alignment',
            gradient: 'from-green-500/20 to-teal-500/20'
        },
        {
            emoji: '📋',
            title: 'List Conversion',
            description: 'Converts bullet points and numbered lists with nested structure support',
            gradient: 'from-orange-500/20 to-red-500/20'
        },
        {
            emoji: '🔗',
            title: 'Link Creation',
            description: 'Automatically creates markdown links from URLs and email addresses',
            gradient: 'from-cyan-500/20 to-blue-500/20'
        },
        {
            emoji: '✨',
            title: 'Text Formatting',
            description: 'Formats bold, italic, and inline code with proper markdown syntax',
            gradient: 'from-purple-500/20 to-pink-500/20'
        },
        {
            emoji: '💻',
            title: 'Code Blocks',
            description: 'Identifies and formats code blocks with syntax highlighting support',
            gradient: 'from-gray-500/20 to-slate-500/20'
        },
        {
            emoji: '💾',
            title: 'Auto-Save',
            description: 'Automatically saves your work locally so you never lose progress',
            gradient: 'from-indigo-500/20 to-blue-500/20'
        }
    ]

    // AI-specific features
    const aiFeatures: Feature[] = [
        {
            emoji: '🤖',
            title: 'AI Enhancement',
            description: 'Powered by local LLM for intelligent text formatting and structure optimization',
            gradient: 'from-violet-500/20 to-purple-500/20'
        },
        {
            emoji: '😊',
            title: 'Smart Emojis',
            description: 'Adds contextually relevant emojis to headers and sections automatically',
            gradient: 'from-yellow-500/20 to-orange-500/20'
        }
    ]

    // Combine features based on AI availability
    const features = [
        ...baseFeatures,
        ...(aiAvailable && useAI ? aiFeatures.slice(0, 1) : []),
        ...(aiAvailable && useAI && addEmojis ? aiFeatures.slice(1) : [])
    ]

    const totalCards = features.length
    const cardsPerView = 3 // Show 3 cards at once on desktop
    const maxIndex = Math.max(0, totalCards - cardsPerView)

    // Auto-play functionality
    useEffect(() => {
        if (!isAutoPlaying) return

        const interval = setInterval(() => {
            setCurrentIndex(prev => (prev >= maxIndex ? 0 : prev + 1))
        }, 4000) // Change every 4 seconds

        return () => clearInterval(interval)
    }, [isAutoPlaying, maxIndex])

    const goToPrevious = () => {
        setIsAutoPlaying(false)
        setCurrentIndex(prev => (prev <= 0 ? maxIndex : prev - 1))
        setTimeout(() => setIsAutoPlaying(true), 10000) // Resume auto-play after 10s
    }

    const goToNext = () => {
        setIsAutoPlaying(false)
        setCurrentIndex(prev => (prev >= maxIndex ? 0 : prev + 1))
        setTimeout(() => setIsAutoPlaying(true), 10000) // Resume auto-play after 10s
    }

    const goToSlide = (index: number) => {
        setIsAutoPlaying(false)
        setCurrentIndex(Math.min(index, maxIndex))
        setTimeout(() => setIsAutoPlaying(true), 10000) // Resume auto-play after 10s
    }

    return (
        <div className="mt-8 relative">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                    ✨ Features
                    {aiAvailable && useAI && (
                        <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                            AI Enhanced
                        </span>
                    )}
                </h3>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={goToPrevious}
                        className="h-8 w-8 rounded-full"
                        disabled={totalCards <= cardsPerView}
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={goToNext}
                        className="h-8 w-8 rounded-full"
                        disabled={totalCards <= cardsPerView}
                    >
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* Desktop Gallery */}
            <div className="hidden md:block relative overflow-hidden rounded-xl">
                <div
                    className="flex transition-transform duration-500 ease-out"
                    style={{ transform: `translateX(-${currentIndex * (100 / cardsPerView)}%)` }}
                >
                    {features.map((feature, index) => (
                        <div
                            key={index}
                            className="flex-shrink-0 w-1/3 px-2"
                        >
                            <div className={cn(
                                "relative p-6 rounded-xl border bg-gradient-to-br transition-all duration-300 hover:scale-105 hover:shadow-lg group cursor-pointer",
                                feature.gradient,
                                "bg-card border-border"
                            )}>
                                <div className="flex items-start gap-4">
                                    <div className="text-3xl flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                                        {feature.emoji}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                                            {feature.title}
                                        </h4>
                                        <p className="text-sm text-muted-foreground leading-relaxed">
                                            {feature.description}
                                        </p>
                                    </div>
                                </div>
                                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Mobile Gallery */}
            <div className="md:hidden">
                <div className="relative overflow-hidden rounded-xl">
                    <div
                        className="flex transition-transform duration-500 ease-out"
                        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
                    >
                        {features.map((feature, index) => (
                            <div
                                key={index}
                                className="flex-shrink-0 w-full px-1"
                            >
                                <div className={cn(
                                    "relative p-6 rounded-xl border bg-gradient-to-br transition-all duration-300 group",
                                    feature.gradient,
                                    "bg-card border-border"
                                )}>
                                    <div className="text-center">
                                        <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">
                                            {feature.emoji}
                                        </div>
                                        <h4 className="font-semibold text-foreground mb-3 group-hover:text-primary transition-colors">
                                            {feature.title}
                                        </h4>
                                        <p className="text-sm text-muted-foreground leading-relaxed">
                                            {feature.description}
                                        </p>
                                    </div>
                                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Dots Indicator */}
            {totalCards > cardsPerView && (
                <div className="flex justify-center gap-2 mt-6">
                    {Array.from({ length: totalCards > cardsPerView ? maxIndex + 1 : totalCards }).map((_, index) => (
                        <button
                            key={index}
                            onClick={() => goToSlide(index)}
                            className={cn(
                                "w-2 h-2 rounded-full transition-all duration-300",
                                index === currentIndex
                                    ? "bg-primary w-6"
                                    : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
                            )}
                        />
                    ))}
                </div>
            )}

            {/* Auto-play indicator */}
            {isAutoPlaying && totalCards > cardsPerView && (
                <div className="absolute top-2 right-2">
                    <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                </div>
            )}
        </div>
    )
}