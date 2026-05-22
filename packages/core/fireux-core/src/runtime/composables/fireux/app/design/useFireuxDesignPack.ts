export type FireuxDesignColorMode = 'light' | 'dark'
export type FireuxDesignStyleMap = Record<string, string>

export type FireuxDesignPack = {
  color_mode: FireuxDesignColorMode
  style: FireuxDesignStyleMap
}

export type FireuxDesignPackPreset = Partial<FireuxDesignPack> & {
  style?: FireuxDesignStyleMap
}

export type FireuxDesignPackStyleOptions = {
  cssVarPrefix?: string
  presets?: Record<string, FireuxDesignPackPreset>
}

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

export const FIREUX_DESIGN_PACK_PRESETS: Record<string, FireuxDesignPackPreset> = {
  classic: {
    color_mode: 'light',
    style: {},
  },
  clean: {
    color_mode: 'light',
    style: {
      font: 'sans',
    },
  },
  dark: {
    color_mode: 'dark',
    style: {},
  },
  dark_gold: {
    color_mode: 'dark',
    style: {
      accent: '#F0C84D',
    },
  },
}

export const DEFAULT_FIREUX_DESIGN_PACK: FireuxDesignPack = {
  color_mode: 'light',
  style: {},
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

const camelSurface = (surface: string) =>
  normalizeDesignToken(surface).replace(/_([a-z0-9])/g, (_match, char: string) =>
    char.toUpperCase()
  )

const surfaceKeys = (surface: string) => {
  const normalized = normalizeDesignToken(surface)
  const camel = camelSurface(surface)
  return {
    snake: normalized,
    camel,
    designPackSnake: `${normalized}_design_pack`,
    designPackCamel: `${camel}DesignPack`,
    designSnake: `${normalized}_design`,
    designCamel: `${camel}Design`,
  }
}

const resolvePreset = (
  record: Record<string, unknown>,
  presets: Record<string, FireuxDesignPackPreset>
): FireuxDesignPackPreset | null => {
  const token = normalizeDesignToken(
    firstCleanString(record, ['preset', 'theme', 'design_id', 'designId'])
  )

  return token ? presets[token] ?? null : null
}

const nestedSurfaceCandidate = (
  value: unknown,
  surface: string
): unknown => {
  const record = asRecord(value)
  if (!surface) return record

  const keys = surfaceKeys(surface)
  return record[keys.snake] ?? record[keys.camel] ?? null
}

export function normalizeFireuxDesignColorMode(
  value: unknown
): FireuxDesignColorMode | '' {
  const mode = clean(value).toLowerCase()
  return mode === 'light' || mode === 'dark' ? mode : ''
}

export function resolveFireuxDesignPackSource(
  surface: string,
  ...sources: unknown[]
): Record<string, unknown> {
  const keys = surfaceKeys(surface)

  for (const source of sources) {
    const record = asRecord(source)
    const design = asRecord(record.design)
    const designPack = asRecord(record.design_pack || record.designPack)
    const designPacks = asRecord(record.design_packs || record.designPacks)
    const surfaceFromDesignPacks = nestedSurfaceCandidate(designPacks, surface)
    const surfaceFromDesignPack = nestedSurfaceCandidate(designPack, surface)
    const surfaceFromDesign = nestedSurfaceCandidate(design, surface)

    const candidates = [
      record[keys.designPackSnake],
      record[keys.designPackCamel],
      surfaceFromDesignPacks,
      surfaceFromDesignPack,
      record[keys.designSnake],
      record[keys.designCamel],
      surfaceFromDesign,
      record.public_menu_design,
      record.publicMenuDesign,
      design.public_menu,
      design.publicMenu,
      designPack,
      design,
      record,
    ]

    const match = candidates.find(hasDesignKeys)
    if (match) return asRecord(match)
  }

  return {}
}

export function resolveFireuxDesignPack(input: {
  surface?: string
  sources?: unknown[]
  presets?: Record<string, FireuxDesignPackPreset>
  defaultColorMode?: FireuxDesignColorMode
} = {}): FireuxDesignPack {
  const presets = input.presets ?? FIREUX_DESIGN_PACK_PRESETS
  const source = resolveFireuxDesignPackSource(
    input.surface ?? '',
    ...(input.sources ?? [])
  )
  const preset = resolvePreset(source, presets)

  return {
    color_mode:
      normalizeFireuxDesignColorMode(source.color_mode || source.colorMode) ||
      normalizeFireuxDesignColorMode(preset?.color_mode) ||
      input.defaultColorMode ||
      DEFAULT_FIREUX_DESIGN_PACK.color_mode,
    style: {
      ...(preset?.style ?? {}),
      ...asRecord(source.style),
    } as FireuxDesignStyleMap,
  }
}

export function resolveFireuxDesignPackStyle(
  design: unknown,
  options: FireuxDesignPackStyleOptions = {}
): FireuxDesignStyleMap {
  const prefix = clean(options.cssVarPrefix) || 'fireux-design'
  const presets = options.presets ?? FIREUX_DESIGN_PACK_PRESETS
  const record = asRecord(design)
  const presetStyle = resolvePreset(record, presets)?.style ?? {}
  const sourceStyle = asRecord(record.style)
  const styleSource = { ...presetStyle, ...sourceStyle, ...record }
  const style: FireuxDesignStyleMap = {}
  const cssVar = (key: string) => `--${prefix}-${key}`
  const background = pickColor(styleSource, [
    'background',
    'background_color',
    'backgroundColor',
    'bg',
  ])
  const text = pickColor(styleSource, ['text', 'text_color', 'textColor'])
  const muted = pickColor(styleSource, [
    'muted',
    'muted_text',
    'mutedText',
    'muted_text_color',
    'mutedTextColor',
  ])
  const toned = pickColor(styleSource, ['toned', 'toned_text', 'tonedText'])
  const border = pickColor(styleSource, ['border', 'border_color', 'borderColor'])
  const accent = pickColor(styleSource, ['accent', 'accent_color', 'accentColor'])
  const font = pickFont(styleSource, ['font', 'font_family', 'fontFamily'])
  const headingFont = pickFont(styleSource, [
    'heading_font',
    'headingFont',
    'heading_font_family',
    'headingFontFamily',
  ])
  const radius = firstCleanString(styleSource, ['radius'])

  if (background) style[cssVar('bg')] = background
  if (text) style[cssVar('text')] = text
  if (muted) style[cssVar('muted')] = muted
  if (toned) style[cssVar('toned')] = toned
  if (border) style[cssVar('border')] = border
  if (accent) style[cssVar('accent')] = accent
  if (font) style[cssVar('font')] = font
  if (headingFont) style[cssVar('heading-font')] = headingFont
  if (/^\d+(?:px|rem)$/.test(radius)) style[cssVar('radius')] = radius

  return style
}
