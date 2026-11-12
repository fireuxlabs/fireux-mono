import { APP_PALETTE_KEYS, type AppTheme } from '../../../types/theme'

/** Validate the optional source-owned App theme without acquiring runtime state. */
export function resolveAppTheme(value: unknown): AppTheme | undefined {
  if (value === undefined) return
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error('[fireux] app.config.theme must be an object.')
  }
  const theme = value as AppTheme
  const palette = theme.palette
  if (
    !palette ||
    typeof palette !== 'object' ||
    Array.isArray(palette) ||
    Object.keys(palette).length !== APP_PALETTE_KEYS.length ||
    APP_PALETTE_KEYS.some(
      (key) =>
        typeof palette[key] !== 'string' ||
        !/^#[0-9a-f]{6}$/i.test(palette[key])
    )
  ) {
    throw new Error(
      '[fireux] app.config.theme.palette must provide exactly eight 6-digit semantic hex colours.'
    )
  }
  if (theme.typography) {
    const { display_family, body_family } = theme.typography
    if (
      [display_family, body_family].some(
        (family) =>
          typeof family !== 'string' || !family.trim() || family.length > 200
      )
    ) {
      throw new Error(
        '[fireux] app.config.theme.typography must provide display_family and body_family.'
      )
    }
  }
  return theme
}
