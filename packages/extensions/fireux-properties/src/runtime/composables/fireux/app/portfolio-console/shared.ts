export const ROOT_PORTFOLIO_COLLECTION_PATH = 'portfolios'
export const TEST_PORTFOLIO_COLLECTION_PATH = 'test-portfolios'
export const APP_PORTFOLIO_COLLECTION_NAME = 'portfolios'

const normalizeString = (value: unknown) => String(value ?? '').trim()
const normalizePath = (value: unknown) =>
  normalizeString(value).replace(/^\/+|\/+$/g, '')

export function resolvePortfolioConsoleCollectionPath(appId: unknown) {
  const normalizedAppId = normalizePath(appId)
  return normalizedAppId
    ? `apps/${normalizedAppId}/${APP_PORTFOLIO_COLLECTION_NAME}`
    : ''
}

export function resolveRuntimePortfolioPath(
  collectionPath: unknown,
  portfolioId: unknown,
  childCollection?: unknown
) {
  const basePath = normalizePath(collectionPath)
  const id = normalizePath(portfolioId)
  const childPath = normalizePath(childCollection)

  if (!basePath || !id) return ''

  const portfolioPath = `${basePath}/${id}`
  return childPath ? `${portfolioPath}/${childPath}` : portfolioPath
}
