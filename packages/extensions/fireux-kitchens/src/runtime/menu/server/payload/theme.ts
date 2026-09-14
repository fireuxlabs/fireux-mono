import type { WorkspacePalette, WorkspaceTheme } from 'fireux-core/types/theme'

export type MenuThemeSource = 'menu' | 'kitchen' | 'default'

const record = (value: unknown): Record<string, unknown> =>
  value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {}
const text = (value: unknown) => String(value ?? '').trim()
const readPalette = (value: unknown): WorkspacePalette | null => {
  const source = record(value)
  const keys = ['canvas', 'text', 'accent', 'accent_contrast'] as const
  if (Object.keys(source).length !== keys.length) return null
  const entries = keys.map(
    (key) => [key, text(source[key]).toLowerCase()] as const
  )
  if (entries.some(([, color]) => !/^#[0-9a-f]{6}$/.test(color))) return null
  return Object.fromEntries(entries) as WorkspacePalette
}

const themePalette = (value: unknown) =>
  readPalette(record(record(value).theme).palette)

export function resolveEffectiveMenuTheme(
  menuData: unknown,
  kitchenTheme: unknown
): { theme: WorkspaceTheme; themeSource: MenuThemeSource } {
  const menuPalette = themePalette(menuData)
  if (menuPalette)
    return { theme: { palette: menuPalette }, themeSource: 'menu' }

  const kitchenPalette = readPalette(record(kitchenTheme).palette)
  if (kitchenPalette) {
    return { theme: { palette: kitchenPalette }, themeSource: 'kitchen' }
  }

  return {
    theme: { palette: { canvas: '#f8fafc', text: '#0f172a', accent: '#0f766e', accent_contrast: '#ffffff' } },
    themeSource: 'default',
  }
}
