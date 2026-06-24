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
  accentDark: '#CFA85A',
  accentDarkRgb: '207 168 90',
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
/* La Tap theme spine: app chrome, local molecules, and emitted menu style share these tokens. */
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
  --latap-app-bg: #ff00cc;
  --latap-page-fg: var(--brand-ink);
  --latap-page-copy-fg: color-mix(in srgb, var(--latap-page-fg) 78%, transparent);
  --latap-page-wash: #ff00cc;
  --latap-landing-wash-rgb: var(--brand-ink-rgb);
}

:root.dark {
  --brand-accent-display: ${colors.accentDark};
  --brand-accent-display-rgb: ${colors.accentDarkRgb};
  --latap-app-bg: #ffff00;
  --latap-page-fg: var(--brand-canvas);
  --latap-page-copy-fg: color-mix(in srgb, var(--latap-page-fg) 88%, transparent);
  --latap-page-wash: #ffff00;
  --latap-landing-wash-rgb: var(--brand-accent-display-rgb);
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
export const laTapBerneTheme = {
  colors,
  palette,
  cssVariables,
  menuPageStyle,
} as const
