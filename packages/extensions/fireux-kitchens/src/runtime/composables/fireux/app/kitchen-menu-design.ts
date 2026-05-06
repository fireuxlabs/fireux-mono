import type { MenuDesign } from '../../../models/menu.model'

export const DEFAULT_MENU_DESIGN: Required<MenuDesign> = {
  background_hex: '#FFF8EF',
  text_hex: '#1F1A17',
}

export const MENU_DESIGN_HEX_PATTERN = /^#(?:[0-9A-F]{3}|[0-9A-F]{6})$/i

export function isMenuDesignHex(value: unknown): value is string {
  return MENU_DESIGN_HEX_PATTERN.test(String(value ?? '').trim())
}

export function normalizeMenuDesignHex(
  value: unknown,
  fallback: string
): string {
  const raw = String(value ?? '').trim()
  const normalized = (raw.startsWith('#') ? raw : `#${raw}`).toUpperCase()
  return isMenuDesignHex(normalized) ? normalized : fallback
}

export function expandMenuDesignHex(value: unknown, fallback: string): string {
  const normalized = normalizeMenuDesignHex(value, fallback)
  if (normalized.length !== 4) return normalized

  const [, r = '', g = '', b = ''] = normalized
  return `#${r}${r}${g}${g}${b}${b}`.toUpperCase()
}

export function resolveMenuDesign(value: unknown): Required<MenuDesign> {
  const design = (value ?? {}) as MenuDesign

  return {
    background_hex: normalizeMenuDesignHex(
      design.background_hex,
      DEFAULT_MENU_DESIGN.background_hex
    ),
    text_hex: normalizeMenuDesignHex(
      design.text_hex,
      DEFAULT_MENU_DESIGN.text_hex
    ),
  }
}
