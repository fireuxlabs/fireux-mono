import type {
  PageStyle,
  PageStyleFontSource,
} from 'fireux-core/runtime/models/core/style.model'

export type MenuThemeFontOption = {
  id: string
  label: string
  description: string
  source: PageStyleFontSource
  family: string
  fallback: string
}

export const menuThemeFontOptions: MenuThemeFontOption[] = [
  {
    id: 'system',
    label: 'System',
    description: 'Use the app font.',
    source: 'system',
    family: '',
    fallback: 'var(--font-sans)',
  },
  {
    id: 'playfair-display',
    label: 'Playfair Display',
    description: 'Elegant restaurant serif.',
    source: 'google',
    family: 'Playfair Display',
    fallback: 'serif',
  },
  {
    id: 'lora',
    label: 'Lora',
    description: 'Warm readable serif.',
    source: 'google',
    family: 'Lora',
    fallback: 'serif',
  },
  {
    id: 'cormorant-garamond',
    label: 'Cormorant Garamond',
    description: 'Classic fine dining serif.',
    source: 'google',
    family: 'Cormorant Garamond',
    fallback: 'serif',
  },
  {
    id: 'inter',
    label: 'Inter',
    description: 'Clean modern sans.',
    source: 'google',
    family: 'Inter',
    fallback: 'var(--font-sans)',
  },
  {
    id: 'nunito-sans',
    label: 'Nunito Sans',
    description: 'Friendly rounded sans.',
    source: 'google',
    family: 'Nunito Sans',
    fallback: 'var(--font-sans)',
  },
  {
    id: 'oswald',
    label: 'Oswald',
    description: 'Condensed menu-board style.',
    source: 'google',
    family: 'Oswald',
    fallback: 'var(--font-sans)',
  },
]

export const menuThemeDefaultPageStyle = {
  background_color_light: '#f8fafc',
  background_color_dark: '#0f172a',
  font_color_light: '#0f172a',
  font_color_dark: '#f8fafc',
  title_color_light: '',
  title_color_dark: '',
  primary_color: '#0f766e',
  secondary_color: '#64748b',
  font_source: 'system',
  font_family: '',
  title_font_source: 'system',
  title_font_family: '',
} satisfies Partial<PageStyle>

const systemFont = menuThemeFontOptions[0]!
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

export function menuThemeFontFromId(id: string) {
  return menuThemeFontOptions.find((option) => option.id === id) || systemFont
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
  const source = text(sourceValue) as PageStyleFontSource
  const family = text(familyValue)
  const option = menuThemeFontOptions.find(
    (font) => font.source === source && font.family === family
  ) || systemFont
  const cssFamily = option.family
    ? `"${option.family}", ${option.fallback}`
    : option.fallback

  return {
    ...option,
    cssFamily,
    stylesheetUrl: googleFontStylesheetUrl(option),
  }
}

function googleFontStylesheetUrl(option: MenuThemeFontOption) {
  if (option.source !== 'google' || !option.family) return ''

  const family = option.family.replace(/\s+/g, '+')
  return `https://fonts.googleapis.com/css2?family=${family}:wght@400;500;600;700&display=swap`
}
