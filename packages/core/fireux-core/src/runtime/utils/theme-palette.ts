import {
  APP_PALETTE_KEYS,
  CONSOLE_PALETTE_KEYS,
  type AppPalette,
  type AppPaletteLayer,
  type WorkspacePalette,
} from '../../types/theme.ts'
import { normalizeHexColor } from './normalize-hex-color'

const record = (value: unknown): Record<string, unknown> | null =>
  value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null

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
  if (Object.keys(source).some((key) => !allowed.has(key))) return null

  const palette: AppPaletteLayer = {}
  for (const key of APP_PALETTE_KEYS) {
    if (!Object.hasOwn(source, key)) continue
    const color = normalizeHexColor(source[key])
    if (!color) return null
    palette[key] = color
  }
  return palette
}

export const workspacePaletteFromApp = (
  palette: AppPalette
): WorkspacePalette => ({
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
    APP_PALETTE_KEYS.flatMap((key) =>
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
