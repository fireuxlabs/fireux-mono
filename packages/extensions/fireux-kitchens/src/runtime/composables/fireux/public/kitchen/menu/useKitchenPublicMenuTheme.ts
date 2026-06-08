import type {
  PageStyle,
  PageStyleFontSource,
} from 'fireux-core/runtime/models/core/style.model'

export type KitchenPublicMenuFontOption = {
  id: string
  label: string
  description: string
  source: PageStyleFontSource
  family: string
  fallback: string
}

export const kitchenPublicMenuFontOptions: KitchenPublicMenuFontOption[] = [
  {
    id: 'system',
    label: 'System',
    description: 'Use the app font.',
    source: 'system',
    family: '',
    fallback: 'ui-sans-serif, system-ui, sans-serif',
  },
  {
    id: 'playfair-display',
    label: 'Playfair Display',
    description: 'Elegant restaurant serif.',
    source: 'google',
    family: 'Playfair Display',
    fallback: 'serif',
  },
  {
    id: 'lora',
    label: 'Lora',
    description: 'Warm readable serif.',
    source: 'google',
    family: 'Lora',
    fallback: 'serif',
  },
  {
    id: 'cormorant-garamond',
    label: 'Cormorant Garamond',
    description: 'Classic fine dining serif.',
    source: 'google',
    family: 'Cormorant Garamond',
    fallback: 'serif',
  },
  {
    id: 'inter',
    label: 'Inter',
    description: 'Clean modern sans.',
    source: 'google',
    family: 'Inter',
    fallback: 'ui-sans-serif, system-ui, sans-serif',
  },
  {
    id: 'nunito-sans',
    label: 'Nunito Sans',
    description: 'Friendly rounded sans.',
    source: 'google',
    family: 'Nunito Sans',
    fallback: 'ui-sans-serif, system-ui, sans-serif',
  },
  {
    id: 'oswald',
    label: 'Oswald',
    description: 'Condensed menu-board style.',
    source: 'google',
    family: 'Oswald',
    fallback: 'ui-sans-serif, system-ui, sans-serif',
  },
]

const systemFont = kitchenPublicMenuFontOptions[0]!
const text = (value: unknown) => String(value ?? '').trim()

export function kitchenPublicMenuFontFromId(id: string) {
  return kitchenPublicMenuFontOptions.find((option) => option.id === id) || systemFont
}

export function resolveKitchenPublicMenuFont(style?: Partial<PageStyle> | null) {
  return resolveKitchenPublicMenuFontToken(style?.font_source, style?.font_family)
}

export function resolveKitchenPublicMenuTitleFont(style?: Partial<PageStyle> | null) {
  const hasTitleFont = Boolean(
    text(style?.title_font_source) || text(style?.title_font_family)
  )
  if (!hasTitleFont) return resolveKitchenPublicMenuFont(style)

  return resolveKitchenPublicMenuFontToken(
    style?.title_font_source,
    style?.title_font_family
  )
}

function resolveKitchenPublicMenuFontToken(
  sourceValue: unknown,
  familyValue: unknown
) {
  const source = text(sourceValue) as PageStyleFontSource
  const family = text(familyValue)
  const option = kitchenPublicMenuFontOptions.find(
    (font) => font.source === source && font.family === family
  ) || systemFont
  const cssFamily = option.family
    ? `"${option.family}", ${option.fallback}`
    : option.fallback

  return {
    ...option,
    cssFamily,
    stylesheetUrl: googleFontStylesheetUrl(option),
  }
}

function googleFontStylesheetUrl(option: KitchenPublicMenuFontOption) {
  if (option.source !== 'google' || !option.family) return ''

  const family = option.family.replace(/\s+/g, '+')
  return `https://fonts.googleapis.com/css2?family=${family}:wght@400;500;600;700&display=swap`
}
