export type RuntimePortfolioMode = 'live' | 'test' | 'read-only'

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
  if (normalized === 'dummy' || normalized === 'readonly') return 'read-only'
  if (normalized === 'live' || normalized === 'test' || normalized === 'read-only') {
    return normalized
  }
  return null
}

export const resolveRuntimePortfolioCollectionPath = (
  mode: RuntimePortfolioMode
): 'portfolios' | 'test-portfolios' => (mode === 'live' ? 'portfolios' : 'test-portfolios')
