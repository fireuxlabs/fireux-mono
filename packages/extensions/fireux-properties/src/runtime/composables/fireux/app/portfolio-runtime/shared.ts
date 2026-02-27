export type RuntimePortfolioMode = 'live' | 'read-only'

export type RuntimePortfolioSelection = {
  portfolioId?: string | null | undefined
  mode?: RuntimePortfolioMode | null | undefined
}

export const RUNTIME_PORTFOLIO_ID_KEY = 'fireux-properties:runtime-portfolio:id'
export const RUNTIME_PORTFOLIO_MODE_KEY = 'fireux-properties:runtime-portfolio:mode'

const toSingleValue = (value: unknown): unknown => (Array.isArray(value) ? value[0] : value)

export const normalizeString = (value: unknown): string =>
  String(toSingleValue(value) ?? '').trim()

export const normalizeMode = (value: unknown): RuntimePortfolioMode | null => {
  const normalized = normalizeString(value).toLowerCase()
  if (normalized === 'live' || normalized === 'read-only') return normalized
  return null
}
