// Concurrent edit — 2026-07-22 12:13 CEST — Place/Kitchen palette onboarding: validate, inherit, and compact portable brand colours.
import {
  BRAND_PALETTE_KEYS,
  type SparseBrandPalette,
} from '../models/utils/style.model.ts'
import {
  APP_PALETTE_KEYS,
  CONSOLE_PALETTE_KEYS,
  type AppPalette,
  type AppPaletteLayer,
  type WorkspacePalette,
} from '../../types/theme'

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

function semanticPalette<K extends string>(
  value: unknown,
  keys: readonly K[]
): Record<K, string> | null {
  const source = record(value)
  if (!source || Object.keys(source).length !== keys.length) return null
  const palette = {} as Record<K, string>
  for (const key of keys) {
    const color = normalizeHexColor(source[key])
    if (!color) return null
    palette[key] = color
  }
  return palette
}

export const readWorkspacePalette = (value: unknown): WorkspacePalette | null =>
  semanticPalette(value, CONSOLE_PALETTE_KEYS)

export const readAppPalette = (value: unknown): AppPalette | null =>
  semanticPalette(value, APP_PALETTE_KEYS)

/** Read a sparse canonical App layer without accepting unknown roles. */
export function readAppPaletteLayer(value: unknown): AppPaletteLayer | null {
  const source = record(value)
  if (!source) return null
  const allowed = new Set<string>(APP_PALETTE_KEYS)
  if (Object.keys(source).some(key => !allowed.has(key))) return null

  const palette: AppPaletteLayer = {}
  for (const key of APP_PALETTE_KEYS) {
    if (!Object.hasOwn(source, key)) continue
    const color = normalizeHexColor(source[key])
    if (!color) return null
    palette[key] = color
  }
  return palette
}

export const workspacePaletteFromApp = (palette: AppPalette): WorkspacePalette => ({
  canvas: palette.canvas,
  text: palette.text,
  accent: palette.accent,
  accent_contrast: palette.accent_contrast,
})

/** Keep only App roles that extend or materially override Workspace. */
export function compactAppPalette(
  palette: AppPalette,
  workspacePalette: WorkspacePalette
): AppPaletteLayer {
  return Object.fromEntries(
    APP_PALETTE_KEYS.flatMap(key =>
      palette[key] !== workspacePalette[key as keyof WorkspacePalette]
        ? [[key, palette[key]]]
        : []
    )
  ) as AppPaletteLayer
}

/** Resolve the complete presentation palette from its stored layers. */
export const resolveAppPalette = (
  workspacePalette: WorkspacePalette,
  appPalette: AppPaletteLayer
): AppPalette | null => readAppPalette({ ...workspacePalette, ...appPalette })
