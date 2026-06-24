import type { PageStyle } from 'fireux-core/runtime/models/core/style.model'

type TenantPaletteToken = {
  role: string
  name: string
  color: string
  label: string
}

const colors = {
  canvas: '#F2E8D8',
  canvasRgb: '242 232 216',
  ink: '#171717',
  inkRgb: '23 23 23',
  primary: '#171717',
  accent: '#9A6500',
  accentRgb: '154 101 0',
  darkCanvas: '#171717',
  darkInk: '#F7F1E6',
} as const

const palette: TenantPaletteToken[] = [
  {
    role: 'canvas',
    name: 'Canvas',
    color: 'var(--brand-canvas)',
    label: colors.canvas,
  },
  {
    role: 'ink',
    name: 'Ink',
    color: 'var(--brand-ink)',
    label: colors.ink,
  },
  {
    role: 'primary',
    name: 'Primary',
    color: 'var(--brand-primary)',
    label: colors.primary,
  },
  {
    role: 'accent',
    name: 'Accent',
    color: 'var(--brand-accent)',
    label: colors.accent,
  },
]

const cssVariables = `
:root {
  --brand-canvas: ${colors.canvas};
  --brand-canvas-rgb: ${colors.canvasRgb};
  --brand-ink: ${colors.ink};
  --brand-ink-rgb: ${colors.inkRgb};
  --brand-primary: ${colors.primary};
  --brand-accent: ${colors.accent};
  --brand-accent-rgb: ${colors.accentRgb};
}
`

const menuPageStyle = {
  background_color_light: colors.canvas,
  background_color_dark: colors.darkCanvas,
  font_color_light: colors.ink,
  font_color_dark: colors.darkInk,
  title_color_light: colors.ink,
  title_color_dark: colors.darkInk,
  primary_color: colors.primary,
  secondary_color: colors.accent,
} satisfies Partial<PageStyle>

// Tenant theme spine: app chrome, Nuxt UI palette, and emitted menu API share these tokens.
export const laTapBerneTheme = {
  colors,
  palette,
  cssVariables,
  menuPageStyle,
} as const
