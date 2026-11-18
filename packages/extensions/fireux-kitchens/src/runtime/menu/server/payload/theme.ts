import type { WorkspaceTheme } from 'fireux-core/types/theme'
import { readWorkspacePalette } from 'fireux-core/runtime/utils/theme-palette'

export type MenuThemeSource = 'menu' | 'kitchen' | 'default'

const record = (value: unknown): Record<string, unknown> =>
  value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {}
export function resolveEffectiveMenuTheme(
  menuData: unknown,
  kitchenTheme: unknown,
  kitchenOwned = false
): { theme: WorkspaceTheme; themeSource: MenuThemeSource } {
  if (!kitchenOwned) {
    const menuPalette = readWorkspacePalette(
      record(record(menuData).theme).palette
    )
    if (menuPalette)
      return { theme: { palette: menuPalette }, themeSource: 'menu' }
  }

  const kitchenPalette =
    record(menuData).theme_mode === 'default'
      ? null
      : readWorkspacePalette(record(kitchenTheme).palette)
  if (kitchenPalette) {
    return { theme: { palette: kitchenPalette }, themeSource: 'kitchen' }
  }

  return {
    theme: {
      palette: {
        canvas: '#f8fafc',
        text: '#0f172a',
        accent: '#0f766e',
        accent_contrast: '#ffffff',
      },
    },
    themeSource: 'default',
  }
}
