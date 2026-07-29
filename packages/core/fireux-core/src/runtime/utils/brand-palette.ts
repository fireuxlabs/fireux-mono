// Concurrent edit — 2026-07-22 12:13 CEST — Place/Kitchen palette onboarding: validate, inherit, and compact portable brand colours.
import {
  BRAND_PALETTE_KEYS,
  type SparseBrandPalette,
} from '../models/core/style.model.ts'

export const DEFAULT_BRAND_PALETTE = {
  primary_color: '#0f766e',
  secondary_color: '#64748b',
} as const satisfies Required<SparseBrandPalette>

export type BrandPaletteParseResult =
  | { ok: true; value: SparseBrandPalette }
  | { ok: false; value: {}; error: string }

const record = (value: unknown): Record<string, unknown> | null =>
  value && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown>
    : null

export const normalizeHexColor = (value: unknown) => {
  const candidate = String(value ?? '').trim()
  if (!candidate) return ''
  return /^#[0-9a-f]{6}$/i.test(candidate) ? candidate.toLowerCase() : null
}

/** Strict boundary parser: callers may omit colours, but may not add keys. */
export function parseBrandPalette(value: unknown): BrandPaletteParseResult {
  if (value === undefined || value === null) return { ok: true, value: {} }

  const source = record(value)
  if (!source) {
    return { ok: false, value: {}, error: 'Brand palette must be an object.' }
  }

  const allowed = new Set<string>(BRAND_PALETTE_KEYS)
  const unsupported = Object.keys(source).find(key => !allowed.has(key))
  if (unsupported) {
    return {
      ok: false,
      value: {},
      error: `Brand palette contains unsupported field: ${unsupported}.`,
    }
  }

  const palette: SparseBrandPalette = {}
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

/** Read brand tokens from a broader PageStyle without trusting other keys. */
export function readBrandPalette(value: unknown): SparseBrandPalette {
  const source = record(value)
  if (!source) return {}

  const palette: SparseBrandPalette = {}
  for (const key of BRAND_PALETTE_KEYS) {
    const color = normalizeHexColor(source[key])
    if (color) palette[key] = color
  }
  return palette
}

/** Keep only child tokens that materially override the inherited palette. */
export function compactBrandPalette(
  value: unknown,
  inherited: unknown = DEFAULT_BRAND_PALETTE
): SparseBrandPalette {
  const palette = readBrandPalette(value)
  const parent = {
    ...DEFAULT_BRAND_PALETTE,
    ...readBrandPalette(inherited),
  }

  return Object.fromEntries(
    BRAND_PALETTE_KEYS.flatMap(key =>
      palette[key] && palette[key] !== parent[key]
        ? [[key, palette[key]]]
        : []
    )
  ) as SparseBrandPalette
}
