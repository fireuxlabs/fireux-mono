import type { PageStyle } from 'fireux-core/runtime/models/core/style.model'

type TenantPaletteToken = {
  role: string
  name: string
  color: string
  label: string
}

const colors = {
  canvas: '#EEE8DA',
  canvasRgb: '238 232 218',
  ink: '#151714',
  inkRgb: '21 23 20',
  primary: '#1D3328',
  accent: '#A26A2A',
  accentRgb: '162 106 42',
  accentDark: '#D8A864',
  accentDarkRgb: '216 168 100',
  darkCanvas: '#151714',
  darkInk: '#F5F0E6',
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
/* Bären tenant theme: app chrome and the shared menu surface use one token set. */
:root {
  --brand-canvas: ${colors.canvas};
  --brand-canvas-rgb: ${colors.canvasRgb};
  --brand-ink: ${colors.ink};
  --brand-ink-rgb: ${colors.inkRgb};
  --brand-primary: ${colors.primary};
  --brand-accent: ${colors.accent};
  --brand-accent-rgb: ${colors.accentRgb};
  --brand-accent-display: ${colors.accent};
  --brand-accent-display-rgb: ${colors.accentRgb};
  --baeren-app-bg: var(--brand-canvas);
  --baeren-page-fg: var(--brand-ink);
  --baeren-page-copy-fg: color-mix(in srgb, var(--baeren-page-fg) 78%, transparent);
  --baeren-page-wash: rgb(var(--brand-canvas-rgb) / 76%);
  --baeren-landing-wash-rgb: var(--brand-canvas-rgb);
}

:root.dark {
  --brand-accent-display: ${colors.accentDark};
  --brand-accent-display-rgb: ${colors.accentDarkRgb};
  --baeren-app-bg: ${colors.darkCanvas};
  --baeren-page-fg: var(--brand-canvas);
  --baeren-page-copy-fg: color-mix(in srgb, var(--baeren-page-fg) 88%, transparent);
  --baeren-page-wash: rgb(var(--brand-ink-rgb) / 78%);
  --baeren-landing-wash-rgb: var(--brand-ink-rgb);
}
`

const menuPageStyle = {
  background_color_light: colors.canvas,
  background_color_dark: colors.darkCanvas,
  font_color_light: colors.ink,
  font_color_dark: colors.darkInk,
  title_color_light: colors.ink,
  title_color_dark: colors.darkInk,
  // PageStyle has one primary token for both modes; use the gold accent so menu prices/controls stay visible on dark canvas.
  primary_color: colors.accentDark,
  secondary_color: colors.accent,
} satisfies Partial<PageStyle>

// Tenant theme spine: app chrome, Nuxt UI palette, and emitted menu API share these tokens.
export const baerenRinggenbergTheme = {
  colors,
  palette,
  cssVariables,
  menuPageStyle,
} as const
