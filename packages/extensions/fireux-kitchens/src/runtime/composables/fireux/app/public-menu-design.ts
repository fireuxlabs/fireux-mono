import {
  FIREUX_DESIGN_PACK_PRESETS,
  normalizeFireuxDesignColorMode,
  resolveFireuxDesignPack,
  resolveFireuxDesignPackSource,
  resolveFireuxDesignPackStyle,
  type FireuxDesignPackPreset,
} from 'fireux-core/runtime/composables/fireux/app/design/useFireuxDesignPack'

type StyleMap = Record<string, string>
export type PublicMenuColorMode = 'light' | 'dark'

export type PublicMenuDesign = {
  color_mode: PublicMenuColorMode
}

export const PUBLIC_MENU_DESIGN_CHOICES = [
  { id: 'classic', label: 'Classic', description: 'Warm light menu' },
  { id: 'clean', label: 'Clean', description: 'Simple light menu' },
  { id: 'dark', label: 'Dark', description: 'Classic dark menu' },
  { id: 'dark-gold', label: 'Dark Gold', description: 'Dark menu with gold accent' },
] as const

const PUBLIC_MENU_DESIGN_PRESETS: Record<string, FireuxDesignPackPreset> = {
  ...FIREUX_DESIGN_PACK_PRESETS,
}

export const DEFAULT_PUBLIC_MENU_DESIGN: PublicMenuDesign = {
  color_mode: 'light',
}

export function normalizePublicMenuColorMode(
  value: unknown
): PublicMenuColorMode | '' {
  return normalizeFireuxDesignColorMode(value)
}

export function resolvePublicMenuDesign(...sources: unknown[]): PublicMenuDesign {
  const pack = resolveFireuxDesignPack({
    surface: 'public_menu',
    sources,
    presets: PUBLIC_MENU_DESIGN_PRESETS,
    defaultColorMode: DEFAULT_PUBLIC_MENU_DESIGN.color_mode,
  })

  return {
    color_mode: pack.color_mode,
  }
}

export function resolvePublicMenuDesignSource(...sources: unknown[]) {
  return resolveFireuxDesignPackSource('public_menu', ...sources)
}

export function resolvePublicMenuDesignStyle(design: unknown): StyleMap {
  return resolveFireuxDesignPackStyle(design, {
    cssVarPrefix: 'public-menu',
    presets: PUBLIC_MENU_DESIGN_PRESETS,
  })
}
