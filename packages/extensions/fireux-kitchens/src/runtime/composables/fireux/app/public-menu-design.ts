export type PublicMenuColorMode = 'light' | 'dark'

export type PublicMenuDesign = {
  color_mode: PublicMenuColorMode
}

export const DEFAULT_PUBLIC_MENU_DESIGN: PublicMenuDesign = {
  color_mode: 'light',
}

export function normalizePublicMenuColorMode(
  value: unknown
): PublicMenuColorMode | '' {
  const mode = String(value ?? '').trim().toLowerCase()
  return mode === 'light' || mode === 'dark' ? mode : ''
}

export function resolvePublicMenuDesign(
  kitchenDesign: unknown,
  menuDesign?: unknown
): PublicMenuDesign {
  const readMode = (value: unknown) => {
    if (!value || typeof value !== 'object' || Array.isArray(value)) return ''
    return normalizePublicMenuColorMode(
      (value as Record<string, unknown>).color_mode
    )
  }

  return {
    color_mode:
      readMode(menuDesign) ||
      readMode(kitchenDesign) ||
      DEFAULT_PUBLIC_MENU_DESIGN.color_mode,
  }
}
