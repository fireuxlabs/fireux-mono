import type { PageStyle } from 'fireux-core/runtime/models/utils/style.model'
import type { ConsolePalette, ConsoleTheme } from 'fireux-core/types/theme'
import { readMenuPageStyle } from './page-style.ts'

export type MenuThemeSource = 'menu' | 'kitchen' | 'place-default'

const record = (value: unknown): Record<string, unknown> =>
  value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {}
const text = (value: unknown) => String(value ?? '').trim()
const readPalette = (value: unknown): ConsolePalette | null => {
  const source = record(value)
  const keys = ['canvas', 'text', 'accent', 'accent_contrast'] as const
  if (Object.keys(source).length !== keys.length) return null
  const entries = keys.map(
    (key) => [key, text(source[key]).toLowerCase()] as const
  )
  if (entries.some(([, color]) => !/^#[0-9a-f]{6}$/.test(color))) return null
  return Object.fromEntries(entries) as ConsolePalette
}

const themePalette = (value: unknown) =>
  readPalette(record(record(value).theme).palette)

const fallbackPalette = (styleValue: unknown): ConsolePalette => {
  const style = readMenuPageStyle(styleValue) as Partial<PageStyle>
  return {
    canvas: text(style.background_color_light) || '#f8fafc',
    text: text(style.font_color_light) || '#0f172a',
    accent: text(style.primary_color) || '#0f766e',
    accent_contrast: '#ffffff',
  }
}

export function resolveEffectiveMenuTheme(
  menuData: unknown,
  kitchenTheme: unknown,
  pageStyle: unknown
): { theme: ConsoleTheme; themeSource: MenuThemeSource } {
  const menuPalette = themePalette(menuData)
  if (menuPalette)
    return { theme: { palette: menuPalette }, themeSource: 'menu' }

  const kitchenPalette = readPalette(record(kitchenTheme).palette)
  if (kitchenPalette) {
    return { theme: { palette: kitchenPalette }, themeSource: 'kitchen' }
  }

  return {
    theme: { palette: fallbackPalette(pageStyle) },
    themeSource: 'place-default',
  }
}
