import { resolveConsoleEntityCollectionPath } from 'fireux-core/runtime/composables/fireux/firestore/system/console/utils/resolveConsoleEntityCollectionPath'
import type { ConsoleSource } from 'fireux-core/runtime/composables/fireux/app/console/useConsole'
import { AppPortfolioStorage, PortfolioStorage } from '../../../../../../models/portfolio.model'

export const ROOT_PORTFOLIO_COLLECTION_PATH = PortfolioStorage.rootCollection
export const APP_PORTFOLIO_COLLECTION_NAME = AppPortfolioStorage.collection

const normalizeString = (value: unknown) => String(value ?? '').trim()
const normalizePath = (value: unknown) =>
  normalizeString(value).replace(/^\/+|\/+$/g, '')

export function resolvePortfolioConsoleCollectionPath(
  appId: unknown,
  source: ConsoleSource = 'live'
) {
  return resolveConsoleEntityCollectionPath({
    family: APP_PORTFOLIO_COLLECTION_NAME,
    mode: source,
    appId: normalizePath(appId),
    useAppOverlay: true,
  })
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
