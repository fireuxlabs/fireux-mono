import type { PageStyle } from 'fireux-core/runtime/models/utils/style.model'
import {
  compactMenuPageStyle,
  resolveMenuFont,
  resolveMenuPageStyle,
  resolveMenuTitleFont,
} from '../../../../composables/fireux/menu/useMenuTheme'

export const normalizeString = (value: unknown) => String(value ?? '').trim()

// Console theme spine: docs/concepts/console.md. This edits portable menu tokens, not tenant app chrome.
export const normalizePageStyle = (
    style?: Partial<PageStyle> | null
  ): Partial<PageStyle> => {
    const resolved = resolveMenuPageStyle(style)
    const fontSource =
      normalizeString(style?.font_source) === 'google' ? 'google' : 'system'
    const titleFontSource =
      normalizeString(style?.title_font_source) === 'google'
        ? 'google'
        : 'system'
    const hasTitleFont = Boolean(
      normalizeString(style?.title_font_source) ||
        normalizeString(style?.title_font_family)
    )
    const font = resolveMenuFont({
      font_source: fontSource,
      font_family: normalizeString(style?.font_family),
    })
    const titleFont = hasTitleFont
      ? resolveMenuTitleFont({
          title_font_source: titleFontSource,
          title_font_family: normalizeString(style?.title_font_family),
        })
      : font

    return {
      ...resolved,
      title_font_source: titleFont.source,
      title_font_family: titleFont.family,
      font_source: font.source,
      font_family: font.family,
    }
  }

export const pageStyleEquals = (a: Partial<PageStyle>, b: Partial<PageStyle>) =>
    JSON.stringify(normalizePageStyle(a)) ===
    JSON.stringify(normalizePageStyle(b))

export const themeWriteStyle = (style: Partial<PageStyle>): Partial<PageStyle> => ({
    ...compactMenuPageStyle(style),
    ...(style.primary_color ? { primary_color: style.primary_color } : {}),
    ...(style.secondary_color
      ? { secondary_color: style.secondary_color }
      : {}),
  })

export type ThemeSaveRequest = {
    key: string
    appId: string
    kitchenId: string
    style: Partial<PageStyle>
  }
