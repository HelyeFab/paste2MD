// Font weight utilities for Mulish
export const fontWeights = {
    extralight: '200',
    light: '300',
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
    black: '900',
} as const

export type FontWeight = keyof typeof fontWeights

// Helper function to get font weight value
export function getFontWeight(weight: FontWeight): string {
    return fontWeights[weight]
}

// Tailwind font weight classes for Mulish
export const mulishWeights = {
    extralight: 'font-extralight', // 200
    light: 'font-light',           // 300
    normal: 'font-normal',         // 400
    medium: 'font-medium',         // 500
    semibold: 'font-semibold',     // 600
    bold: 'font-bold',             // 700
    extrabold: 'font-extrabold',   // 800
    black: 'font-black',           // 900
} as const

// Font size utilities that work well with Mulish (updated for 17px base)
export const fontSizes = {
    xs: 'text-xs',     // 12.75px
    sm: 'text-sm',     // 14.875px
    base: 'text-base', // 17px (base size)
    lg: 'text-lg',     // 19.125px
    xl: 'text-xl',     // 21.25px
    '2xl': 'text-2xl', // 25.5px
    '3xl': 'text-3xl', // 31.875px
    '4xl': 'text-4xl', // 38.25px
    '5xl': 'text-5xl', // 51px
    '6xl': 'text-6xl', // 63.75px
} as const

// Predefined text styles using Mulish
export const textStyles = {
    // Headings
    h1: 'text-4xl font-bold tracking-tight',
    h2: 'text-3xl font-semibold tracking-tight',
    h3: 'text-2xl font-semibold tracking-tight',
    h4: 'text-xl font-semibold tracking-tight',
    h5: 'text-lg font-medium tracking-tight',
    h6: 'text-base font-medium tracking-tight',

    // Body text
    body: 'text-base font-normal',
    'body-sm': 'text-sm font-normal',
    'body-lg': 'text-lg font-normal',

    // UI text
    caption: 'text-xs font-medium tracking-wide uppercase',
    label: 'text-sm font-medium',
    button: 'text-sm font-medium',

    // Special
    lead: 'text-xl font-light text-muted-foreground',
    muted: 'text-sm text-muted-foreground',
} as const

export type TextStyle = keyof typeof textStyles

// Helper to get text style classes
export function getTextStyle(style: TextStyle): string {
    return textStyles[style]
}