export type RuntimePortfolioMode = 'live' | 'demo' | 'test'

export type RuntimePortfolioSelection = {
  portfolioId?: string | null | undefined
  mode?: RuntimePortfolioMode | null | undefined
}

export const RUNTIME_PORTFOLIO_ID_KEY = 'fireux-properties:runtime-portfolio:id'
export const RUNTIME_PORTFOLIO_MODE_KEY = 'fireux-properties:runtime-portfolio:mode'
export const ROOT_PORTFOLIO_COLLECTION_PATH = 'portfolios'

const toSingleValue = (value: unknown): unknown => (Array.isArray(value) ? value[0] : value)

export const normalizeString = (value: unknown): string =>
  String(toSingleValue(value) ?? '').trim()

export const normalizeMode = (value: unknown): RuntimePortfolioMode | null => {
  const normalized = normalizeString(value).toLowerCase()
  if (normalized === 'demo') return 'demo'
  if (normalized === 'live' || normalized === 'test') {
    return normalized
  }
  return null
}

export const resolvePortfolioConsoleCollectionPath = (appId?: unknown): string => {
  const resolvedAppId = normalizeString(appId)
  return resolvedAppId
    ? `apps/${resolvedAppId}/${ROOT_PORTFOLIO_COLLECTION_PATH}`
    : ROOT_PORTFOLIO_COLLECTION_PATH
}

export const resolveRuntimePortfolioDocumentCollectionPath = (
  mode: RuntimePortfolioMode
): string => (mode === 'test' ? 'test-portfolios' : ROOT_PORTFOLIO_COLLECTION_PATH)

export const resolveRuntimePortfolioDataCollectionPath = (
  mode: RuntimePortfolioMode,
  appId?: unknown
): string => (mode === 'test' ? 'test-portfolios' : resolvePortfolioConsoleCollectionPath(appId))

export const resolveRuntimePortfolioPath = (
  basePath: unknown,
  portfolioId: unknown,
  suffix?: unknown
): string => {
  const resolvedBasePath = normalizeString(basePath)
  const resolvedPortfolioId = normalizeString(portfolioId)
  const resolvedSuffix = normalizeString(suffix)
  if (!resolvedBasePath || !resolvedPortfolioId) return ''
  return resolvedSuffix
    ? `${resolvedBasePath}/${resolvedPortfolioId}/${resolvedSuffix}`
    : `${resolvedBasePath}/${resolvedPortfolioId}`
}

export const resolveRuntimePortfolioCollectionPath =
  resolveRuntimePortfolioDocumentCollectionPath
