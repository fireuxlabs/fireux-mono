// Concurrent edit — 2026-07-20 22:45 CEST — Nitro import repair: resolve the concrete core style model.
// Concurrent edit — 2026-07-22 12:13 CEST — Place/Kitchen palette inheritance: merge style tokens from low to high precedence.
// Concurrent edit — 2026-07-22 12:24 CEST — Canonical Kitchen theme write: validate the full portable style contract server-side.
// Concurrent edit — 2026-07-22 12:39 CEST — Kitchen palette console: validate fonts against the shared rendered token set.
import type { PageStyle } from 'fireux-core/runtime/models/core/style.model.ts'
import {
  readRecord,
  readRecordString,
} from 'fireux-core/runtime/server/utils/records/read.ts'
import { isSupportedMenuThemeFontToken } from '../../../utils/menu-theme-font.ts'

const pageStyleKeys = [
  'background_color_light',
  'background_color_dark',
  'font_color_light',
  'font_color_dark',
  'title_color_light',
  'title_color_dark',
  'primary_color',
  'secondary_color',
  'title_font_source',
  'title_font_family',
  'font_source',
  'font_family',
] as const satisfies readonly (keyof PageStyle)[]

const pageStyleColorKeys = [
  'background_color_light',
  'background_color_dark',
  'font_color_light',
  'font_color_dark',
  'title_color_light',
  'title_color_dark',
  'primary_color',
  'secondary_color',
] as const satisfies readonly (keyof PageStyle)[]

export type MenuPageStyleInputResult =
  | { ok: true; value: Partial<PageStyle> }
  | { ok: false; value: {}; error: string }

// Menu theme spine: compact stored PageStyle tokens before exposing them in menu payloads.
export function readMenuPageStyle(value: unknown): Partial<PageStyle> {
  const record = readRecord(value)
  const entries = pageStyleKeys
    .map((key) => [key, readRecordString(record, key)] as const)
    .filter(([, entry]) => Boolean(entry))

  return Object.fromEntries(entries) as Partial<PageStyle>
}

export function parseMenuPageStyleInput(value: unknown): MenuPageStyleInputResult {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return { ok: false, value: {}, error: 'Menu style must be an object.' }
  }

  const source = value as Record<string, unknown>
  const allowed = new Set<string>(pageStyleKeys)
  const unsupported = Object.keys(source).find(key => !allowed.has(key))
  if (unsupported) {
    return {
      ok: false,
      value: {},
      error: `Menu style contains unsupported field: ${unsupported}.`,
    }
  }

  const style: Partial<PageStyle> = {}
  for (const key of pageStyleColorKeys) {
    const color = String(source[key] ?? '').trim().toLowerCase()
    if (!color) continue
    if (!/^#[0-9a-f]{6}$/.test(color)) {
      return {
        ok: false,
        value: {},
        error: `${key.replaceAll('_', ' ')} must be a 6-digit hex colour.`,
      }
    }
    style[key] = color
  }

  for (const token of [
    {
      sourceKey: 'font_source',
      familyKey: 'font_family',
      label: 'Menu font',
    },
    {
      sourceKey: 'title_font_source',
      familyKey: 'title_font_family',
      label: 'Title font',
    },
  ] as const) {
    const sourceValue = String(source[token.sourceKey] ?? '').trim()
    const family = String(source[token.familyKey] ?? '').trim()
    if (!sourceValue && !family) continue
    if (!isSupportedMenuThemeFontToken(sourceValue, family)) {
      return {
        ok: false,
        value: {},
        error: `${token.label} must use a supported source and family.`,
      }
    }
    style[token.sourceKey] = sourceValue as 'system' | 'google'
    if (family) style[token.familyKey] = family
  }

  return { ok: true, value: style }
}

type MenuPageStyleLayer = {
  source: 'place' | 'app-kitchen' | 'root-kitchen' | 'menu'
  style: unknown
}

// Callers provide low-to-high precedence so every sparse child token inherits.
export function resolveMenuPageStyle(
  ...layers: MenuPageStyleLayer[]
): Partial<PageStyle> {
  const resolved: Partial<PageStyle> = {}
  for (const layer of layers) {
    Object.assign(resolved, readMenuPageStyle(layer.style))
  }
  return resolved
}
