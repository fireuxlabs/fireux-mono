import type { PageStyle } from 'fireux-core/runtime/models/core/style.model'
import {
  readRecord,
  readRecordString,
} from 'fireux-core/runtime/server/utils/records/read.ts'

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

// Public menu theme spine: compact stored PageStyle tokens before exposing them in menu payloads.
export function readMenuPageStyle(value: unknown): Partial<PageStyle> {
  const record = readRecord(value)
  const entries = pageStyleKeys
    .map((key) => [key, readRecordString(record, key)] as const)
    .filter(([, entry]) => Boolean(entry))

  return Object.fromEntries(entries) as Partial<PageStyle>
}

type MenuPageStyleLayer = {
  source: 'tenant-owner-api' | 'app-kitchen' | 'root-kitchen' | 'menu'
  style: unknown
}

const hasMenuPageStyle = (style: Partial<PageStyle>) =>
  Object.keys(style).length > 0

// Menu theme source order lives here so renderers receive one boring page_style object.
export function resolveMenuPageStyle(
  ...layers: MenuPageStyleLayer[]
): Partial<PageStyle> {
  for (const layer of layers) {
    const style = readMenuPageStyle(layer.style)
    if (hasMenuPageStyle(style)) return style
  }

  return {}
}
