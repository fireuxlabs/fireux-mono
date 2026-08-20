// Concurrent edit — 2026-07-20 23:46 CEST — App Support Vocabulary Pass: resolve Portfolio App support paths explicitly.
import { resolveWorkspaceEntityCollectionPath } from 'fireux-core/runtime/composables/fireux/firestore/system/workspace/utils/resolveWorkspaceEntityCollectionPath'
import type { WorkspaceSource } from 'fireux-core/runtime/composables/fireux/workspace/useWorkspace'
import { AppPortfolioStorage, PortfolioStorage } from '../../../../models/portfolio.model.ts'

export const ROOT_PORTFOLIO_COLLECTION_PATH = PortfolioStorage.rootCollection
export const APP_PORTFOLIO_COLLECTION_NAME = AppPortfolioStorage.collection

const normalizeString = (value: unknown) => String(value ?? '').trim()
const normalizePath = (value: unknown) =>
  normalizeString(value).replace(/^\/+|\/+$/g, '')

export function resolvePortfolioWorkspaceCollectionPath(
  appId: unknown,
  source: WorkspaceSource = 'live'
) {
  return resolveWorkspaceEntityCollectionPath({
    family: APP_PORTFOLIO_COLLECTION_NAME,
    mode: source,
    appId: normalizePath(appId),
    useAppSupport: true,
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
