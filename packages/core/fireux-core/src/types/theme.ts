export const CONSOLE_PALETTE_KEYS = [
  'canvas',
  'text',
  'accent',
  'accent_contrast',
] as const

export const APP_PALETTE_KEYS = [
  'canvas',
  'surface',
  'canvas_inverted',
  'text',
  'text_muted',
  'ink',
  'accent',
  'accent_contrast',
] as const

export type WorkspacePalette = Record<(typeof CONSOLE_PALETTE_KEYS)[number], string>
export type AppPalette = Record<(typeof APP_PALETTE_KEYS)[number], string>
/** Sparse App-owned delta over the Workspace palette. */
export type AppPaletteLayer = Partial<AppPalette>
export type WorkspaceTheme = { palette: WorkspacePalette }
/** Complete reviewed palette authored by App source. */
export type AppTheme = {
  palette: AppPalette
  typography?: AppTypography
}
/** Canonical App storage keeps only the App-owned delta. */
export type AppThemeLayer = {
  palette: AppPaletteLayer
  typography?: AppTypography
}

/** Two App-owned families from which templates derive semantic text roles. */
export type AppTypography = {
  display_family: string
  body_family: string
}
