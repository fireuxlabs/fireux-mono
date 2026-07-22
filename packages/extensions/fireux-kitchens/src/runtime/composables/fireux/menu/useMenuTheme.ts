// Concurrent edit — 2026-07-22 12:13 CEST — Place/Kitchen palette inheritance: reuse the Core brand-colour defaults.
// Concurrent edit — 2026-07-22 12:39 CEST — Kitchen palette console: reuse one portable Menu font-token authority.
import type { PageStyle } from 'fireux-core/runtime/models/core/style.model'
import { DEFAULT_BRAND_PALETTE } from 'fireux-core/runtime/utils/brand-palette'
import {
  menuThemeFontFromId,
  resolveMenuThemeFontToken,
} from '../../../utils/menu-theme-font'
export {
  menuThemeFontFromId,
  menuThemeFontOptions,
} from '../../../utils/menu-theme-font'
export type { MenuThemeFontOption } from '../../../utils/menu-theme-font'

export const menuThemeDefaultPageStyle = {
  background_color_light: '#f8fafc',
  background_color_dark: '#0f172a',
  font_color_light: '#0f172a',
  font_color_dark: '#f8fafc',
  title_color_light: '',
  title_color_dark: '',
  primary_color: DEFAULT_BRAND_PALETTE.primary_color,
  secondary_color: DEFAULT_BRAND_PALETTE.secondary_color,
  font_source: 'system',
  font_family: '',
  title_font_source: 'system',
  title_font_family: '',
} satisfies Partial<PageStyle>

const systemFont = menuThemeFontFromId('system')
const text = (value: unknown) => String(value ?? '').trim()

export function resolveMenuPageStyle(
  style?: Partial<PageStyle> | null
): Partial<PageStyle> {
  const backgroundLight =
    text(style?.background_color_light) ||
    menuThemeDefaultPageStyle.background_color_light
  const backgroundDark =
    text(style?.background_color_dark) ||
    menuThemeDefaultPageStyle.background_color_dark
  const fontLight =
    text(style?.font_color_light) ||
    menuThemeDefaultPageStyle.font_color_light
  const fontDark =
    text(style?.font_color_dark) ||
    menuThemeDefaultPageStyle.font_color_dark
  const titleLight = text(style?.title_color_light) || fontLight
  const titleDark = text(style?.title_color_dark) || fontDark

  return {
    background_color_light: backgroundLight,
    background_color_dark: backgroundDark,
    font_color_light: fontLight,
    font_color_dark: fontDark,
    title_color_light: titleLight,
    title_color_dark: titleDark,
    primary_color:
      text(style?.primary_color) ||
      menuThemeDefaultPageStyle.primary_color,
    secondary_color:
      text(style?.secondary_color) ||
      menuThemeDefaultPageStyle.secondary_color,
    font_source:
      text(style?.font_source) === 'google'
        ? 'google'
        : menuThemeDefaultPageStyle.font_source,
    font_family: text(style?.font_family),
    title_font_source:
      text(style?.title_font_source) === 'google'
        ? 'google'
        : menuThemeDefaultPageStyle.title_font_source,
    title_font_family: text(style?.title_font_family),
  }
}

export function compactMenuPageStyle(
  style?: Partial<PageStyle> | null
): Partial<PageStyle> {
  const resolved = resolveMenuPageStyle(style)
  const compact: Partial<PageStyle> = {}
  const colorKeys = [
    'background_color_light',
    'background_color_dark',
    'font_color_light',
    'font_color_dark',
    'title_color_light',
    'title_color_dark',
    'primary_color',
    'secondary_color',
  ] as const satisfies readonly (keyof PageStyle)[]

  for (const key of colorKeys) {
    const value = text(style?.[key])
    const defaultValue = text(resolveMenuPageStyle()[key])
    if (value && value !== defaultValue) compact[key] = value
  }

  const font = resolveMenuFont(resolved)
  const titleFont = resolveMenuTitleFont(resolved)
  if (font.id !== systemFont.id) {
    compact.font_source = font.source
    compact.font_family = font.family
  }
  if (titleFont.id !== font.id) {
    compact.title_font_source = titleFont.source
    compact.title_font_family = titleFont.family
  }

  return compact
}

export function resolveMenuFont(style?: Partial<PageStyle> | null) {
  return resolveMenuFontToken(style?.font_source, style?.font_family)
}

export function resolveMenuTitleFont(style?: Partial<PageStyle> | null) {
  const hasTitleFont = Boolean(
    text(style?.title_font_source) || text(style?.title_font_family)
  )
  if (!hasTitleFont) return resolveMenuFont(style)

  return resolveMenuFontToken(
    style?.title_font_source,
    style?.title_font_family
  )
}

function resolveMenuFontToken(
  sourceValue: unknown,
  familyValue: unknown
) {
  return resolveMenuThemeFontToken(sourceValue, familyValue)
}
