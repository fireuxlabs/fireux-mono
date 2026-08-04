// Concurrent edit — 2026-07-22 12:13 CEST — Place/Kitchen palette onboarding: define one shared sparse brand-palette contract.
/**
 * Runtime models canon: docs/ai/gpt-context.md
 *
 * Family: Model support
 * Storage: shared runtime model support, not a persisted entity
 * Used by: public pages or scoped surfaces that need simple visual tokens
 *
 * Decision note:
 * - PageStyle is a small reusable style token shape.
 * - `*_light` means the value used in light mode; `*_dark` means the value
 *   used in dark mode. It does not mean light-coloured or dark-coloured.
 * - Domain models may store a `style` field using this shape, but should not
 *   define their own copy of these page-level color tokens.
 * - Font tokens store intent only. Renderers decide how to load/resolve a
 *   controlled font family.
 * - Title color tokens are per-mode emphasis tokens. Avoid hidden shared
 *   accent colors for surfaces that only expose light and dark modes.
 */
export type PageStyleFontSource = 'system' | 'google'

export type BrandPalette = {
  primary_color: string
  secondary_color: string
}

export const BRAND_PALETTE_KEYS = [
  'primary_color',
  'secondary_color',
] as const satisfies readonly (keyof BrandPalette)[]

export type BrandPaletteKey = (typeof BRAND_PALETTE_KEYS)[number]
export type SparseBrandPalette = Partial<BrandPalette>

export type PageStyle = BrandPalette & {
  background_color_light: string
  background_color_dark: string
  font_color_light: string
  font_color_dark: string
  title_color_light?: string
  title_color_dark?: string
  title_font_source?: PageStyleFontSource
  title_font_family?: string
  font_source?: PageStyleFontSource
  font_family?: string
}
