import type { WorkspaceSource } from 'fireux-core/runtime/composables/fireux/workspace/useWorkspace'
import { PortfolioStorage } from '../../../../models/portfolio.model.ts'

export const ROOT_PORTFOLIO_COLLECTION_PATH = PortfolioStorage.rootCollection

const normalizeString = (value: unknown) => String(value ?? '').trim()
const normalizePath = (value: unknown) =>
  normalizeString(value).replace(/^\/+|\/+$/g, '')

export function resolvePortfolioWorkspaceCollectionPath(
  _appId: unknown,
  _source: WorkspaceSource = 'live'
) {
  return ROOT_PORTFOLIO_COLLECTION_PATH
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
