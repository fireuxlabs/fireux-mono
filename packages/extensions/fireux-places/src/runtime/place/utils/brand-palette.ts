import type { Place } from '../models/place.model'
import { normalizeHexColor } from 'fireux-core/runtime/utils/normalize-hex-color'

const BRAND_PALETTE_KEYS = [
  'primary_color',
  'secondary_color',
] as const satisfies readonly (keyof Place['brand_palette'])[]

type BrandPaletteParseResult =
  | { ok: true; value: Place['brand_palette'] }
  | { ok: false; value: {}; error: string }

const record = (value: unknown): Record<string, unknown> | null =>
  value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null

/** Strict boundary parser: callers may omit colours, but may not add keys. */
export function parseBrandPalette(value: unknown): BrandPaletteParseResult {
  if (value === undefined || value === null) return { ok: true, value: {} }

  const source = record(value)
  if (!source) {
    return { ok: false, value: {}, error: 'Brand palette must be an object.' }
  }

  const allowed = new Set<string>(BRAND_PALETTE_KEYS)
  const unsupported = Object.keys(source).find((key) => !allowed.has(key))
  if (unsupported) {
    return {
      ok: false,
      value: {},
      error: `Brand palette contains unsupported field: ${unsupported}.`,
    }
  }

  const palette: Place['brand_palette'] = {}
  for (const key of BRAND_PALETTE_KEYS) {
    const color = normalizeHexColor(source[key])
    if (color === null) {
      return {
        ok: false,
        value: {},
        error: `${key.replaceAll('_', ' ')} must be a 6-digit hex colour.`,
      }
    }
    if (color) palette[key] = color
  }

  return { ok: true, value: palette }
}
