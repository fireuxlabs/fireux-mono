// Concurrent edit — 2026-07-22 12:39 CEST — Kitchen palette workspace: centralize portable Menu font tokens for UI and trusted writes.
import type { PageStyleFontSource } from 'fireux-core/runtime/models/utils/style.model'

export type MenuThemeFontOption = {
  id: string
  label: string
  description: string
  source: PageStyleFontSource
  family: string
  fallback: string
}

export const menuThemeFontOptions: MenuThemeFontOption[] = [
  {
    id: 'system',
    label: 'System',
    description: 'Use the app font.',
    source: 'system',
    family: '',
    fallback: 'var(--font-sans)',
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
    fallback: 'var(--font-sans)',
  },
  {
    id: 'nunito-sans',
    label: 'Nunito Sans',
    description: 'Friendly rounded sans.',
    source: 'google',
    family: 'Nunito Sans',
    fallback: 'var(--font-sans)',
  },
  {
    id: 'oswald',
    label: 'Oswald',
    description: 'Condensed menu-board style.',
    source: 'google',
    family: 'Oswald',
    fallback: 'var(--font-sans)',
  },
]

const systemFont = menuThemeFontOptions[0]!
const text = (value: unknown) => String(value ?? '').trim()

export function menuThemeFontFromId(id: string) {
  return menuThemeFontOptions.find(option => option.id === id) || systemFont
}

export function isSupportedMenuThemeFontToken(
  sourceValue: unknown,
  familyValue: unknown
) {
  const source = text(sourceValue)
  const family = text(familyValue)
  return menuThemeFontOptions.some(
    option => option.source === source && option.family === family
  )
}

export function resolveMenuThemeFontToken(
  sourceValue: unknown,
  familyValue: unknown
) {
  const source = text(sourceValue)
  const family = text(familyValue)
  const option = menuThemeFontOptions.find(
    font => font.source === source && font.family === family
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

function googleFontStylesheetUrl(option: MenuThemeFontOption) {
  if (option.source !== 'google' || !option.family) return ''

  const family = option.family.replace(/\s+/g, '+')
  return `https://fonts.googleapis.com/css2?family=${family}:wght@400;500;600;700&display=swap`
}
