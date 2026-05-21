const CSS_COLOR_RE =
  /^#(?:[0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i

const FONT_FAMILIES: Record<string, string> = {
  system:
    'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  sans:
    'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  serif: 'ui-serif, Georgia, Cambria, "Times New Roman", Times, serif',
  display:
    'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
}

const DESIGN_KEYS = new Set([
  'accent',
  'accent_color',
  'accentColor',
  'background',
  'background_color',
  'backgroundColor',
  'bg',
  'border',
  'border_color',
  'borderColor',
  'color_mode',
  'colorMode',
  'design_id',
  'designId',
  'font',
  'font_family',
  'fontFamily',
  'heading_font',
  'headingFont',
  'heading_font_family',
  'headingFontFamily',
  'muted',
  'muted_text',
  'mutedText',
  'muted_text_color',
  'mutedTextColor',
  'preset',
  'radius',
  'theme',
  'text',
  'text_color',
  'textColor',
  'toned',
  'toned_text',
  'tonedText',
])

type StyleMap = Record<string, string>
export type PublicMenuColorMode = 'light' | 'dark'

export type PublicMenuDesign = {
  color_mode: PublicMenuColorMode
}

type PublicMenuPreset = PublicMenuDesign & {
  style: StyleMap
}

export const PUBLIC_MENU_DESIGN_CHOICES = [
  { id: 'classic', label: 'Classic', description: 'Warm light menu' },
  { id: 'clean', label: 'Clean', description: 'Simple light menu' },
  { id: 'dark', label: 'Dark', description: 'Classic dark menu' },
  { id: 'dark-gold', label: 'Dark Gold', description: 'Dark menu with gold accent' },
] as const

const darkGoldPreset: PublicMenuPreset = {
  color_mode: 'dark',
  style: {
    '--public-menu-accent': '#F0C84D',
  },
}

const PUBLIC_MENU_DESIGN_PRESETS: Record<string, PublicMenuPreset> = {
  classic: {
    color_mode: 'light',
    style: {},
  },
  clean: {
    color_mode: 'light',
    style: {
      '--public-menu-font': FONT_FAMILIES.sans,
    },
  },
  dark: {
    color_mode: 'dark',
    style: {},
  },
  dark_gold: darkGoldPreset,
  la_tapberne: darkGoldPreset,
}

export const DEFAULT_PUBLIC_MENU_DESIGN: PublicMenuDesign = {
  color_mode: 'light',
}

const asRecord = (value: unknown): Record<string, unknown> =>
  value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {}

const clean = (value: unknown) => String(value ?? '').trim()

const hasDesignKeys = (value: unknown) => {
  const record = asRecord(value)
  return Object.keys(record).some((key) => DESIGN_KEYS.has(key))
}

const firstCleanString = (
  record: Record<string, unknown>,
  keys: string[]
): string => {
  for (const key of keys) {
    const value = clean(record[key])
    if (value) return value
  }

  return ''
}

const pickColor = (record: Record<string, unknown>, keys: string[]) => {
  const value = firstCleanString(record, keys)
  return CSS_COLOR_RE.test(value) ? value : ''
}

const pickFont = (record: Record<string, unknown>, keys: string[]) => {
  const token = firstCleanString(record, keys).toLowerCase()
  return FONT_FAMILIES[token] || ''
}

const normalizeDesignToken = (value: unknown) =>
  clean(value).toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '')

const resolvePublicMenuDesignPreset = (
  record: Record<string, unknown>
): PublicMenuPreset | null => {
  const token = normalizeDesignToken(
    firstCleanString(record, ['preset', 'theme', 'design_id', 'designId'])
  )

  return token ? PUBLIC_MENU_DESIGN_PRESETS[token] ?? null : null
}

export function normalizePublicMenuColorMode(
  value: unknown
): PublicMenuColorMode | '' {
  const mode = clean(value).toLowerCase()
  return mode === 'light' || mode === 'dark' ? mode : ''
}

export function resolvePublicMenuDesign(
  kitchenDesign: unknown,
  menuDesign?: unknown
): PublicMenuDesign {
  const kitchenSource = resolvePublicMenuDesignSource(kitchenDesign)
  const menuSource = resolvePublicMenuDesignSource(menuDesign)
  const menuPreset = resolvePublicMenuDesignPreset(menuSource)
  const kitchenPreset = resolvePublicMenuDesignPreset(kitchenSource)

  return {
    color_mode:
      normalizePublicMenuColorMode(menuSource.color_mode || menuSource.colorMode) ||
      normalizePublicMenuColorMode(kitchenSource.color_mode || kitchenSource.colorMode) ||
      menuPreset?.color_mode ||
      kitchenPreset?.color_mode ||
      DEFAULT_PUBLIC_MENU_DESIGN.color_mode,
  }
}

export function resolvePublicMenuDesignSource(...sources: unknown[]) {
  for (const source of sources) {
    const record = asRecord(source)
    const design = asRecord(record.design)
    const candidates = [
      record.public_menu_design,
      record.publicMenuDesign,
      design.public_menu,
      design.publicMenu,
      design,
      source,
    ]

    const match = candidates.find(hasDesignKeys)
    if (match) return asRecord(match)
  }

  return {}
}

export function resolvePublicMenuDesignStyle(design: unknown): StyleMap {
  const record = asRecord(design)
  const style: StyleMap = { ...(resolvePublicMenuDesignPreset(record)?.style ?? {}) }
  const background = pickColor(record, [
    'background',
    'background_color',
    'backgroundColor',
    'bg',
  ])
  const text = pickColor(record, ['text', 'text_color', 'textColor'])
  const muted = pickColor(record, [
    'muted',
    'muted_text',
    'mutedText',
    'muted_text_color',
    'mutedTextColor',
  ])
  const toned = pickColor(record, ['toned', 'toned_text', 'tonedText'])
  const border = pickColor(record, ['border', 'border_color', 'borderColor'])
  const accent = pickColor(record, ['accent', 'accent_color', 'accentColor'])
  const font = pickFont(record, ['font', 'font_family', 'fontFamily'])
  const headingFont = pickFont(record, [
    'heading_font',
    'headingFont',
    'heading_font_family',
    'headingFontFamily',
  ])
  const radius = firstCleanString(record, ['radius'])

  if (background) style['--public-menu-bg'] = background
  if (text) style['--public-menu-text'] = text
  if (muted) style['--public-menu-muted'] = muted
  if (toned) style['--public-menu-toned'] = toned
  if (border) style['--public-menu-border'] = border
  if (accent) style['--public-menu-accent'] = accent
  if (font) style['--public-menu-font'] = font
  if (headingFont) style['--public-menu-heading-font'] = headingFont
  if (/^\d+(?:px|rem)$/.test(radius)) style['--public-menu-radius'] = radius

  return style
}
