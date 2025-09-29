import Image from 'next/image'
import { cn } from '@/lib/utils'

interface LogoProps {
    className?: string
    size?: number
    showText?: boolean
    textClassName?: string
}

export function Logo({
    className,
    size = 32,
    showText = true,
    textClassName
}: LogoProps) {
    return (
        <div className={cn('flex items-center gap-2', className)}>
            <Image
                src="/images/file.png"
                alt="Paste2MD Logo"
                width={size}
                height={size}
                className="object-contain"
                priority
            />
            {showText && (
                <span className={cn('font-semibold text-foreground', textClassName)}>
                    Paste2MD
                </span>
            )}
        </div>
    )
}

// Variants for different use cases
export function LogoIcon({ className, size = 24 }: { className?: string; size?: number }) {
    return (
        <Image
            src="/images/file.png"
            alt="Paste2MD"
            width={size}
            height={size}
            className={cn('object-contain', className)}
            priority
        />
    )
}

export function LogoWithText({
    className,
    iconSize = 32,
    textSize = 'text-xl'
}: {
    className?: string
    iconSize?: number
    textSize?: string
}) {
    return (
        <div className={cn('flex items-center gap-3', className)}>
            <LogoIcon size={iconSize} />
            <h1 className={cn('font-bold text-foreground', textSize)}>
                Paste2MD
            </h1>
        </div>
    )
}