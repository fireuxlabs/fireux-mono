import type { Ref } from 'vue'
import type { ConsoleSource } from 'fireux-core/runtime/composables/fireux/app/console/useConsole'
import { normalizeFireuxAppScopeState } from 'fireux-core/runtime/utils/app-scope-state'
import {
  PortfolioStorage,
  type Portfolio,
} from '../../../../../models/portfolio.model'
import type {
  TargetCollectionFilter,
  TargetCollectionFilterValue,
} from '../../collection-selection'
import type { PortfolioSurface } from '../utils/view/usePortfolioInterface'

export type PortfolioCollectionFilterValue = TargetCollectionFilterValue
export type PortfolioCollectionFilter = TargetCollectionFilter
export type PortfolioCollectionSource = ConsoleSource
export type PortfolioCollectionDoc = Partial<Portfolio> & {
  id?: string
}

export type PortfolioCollectionItem = PortfolioSurface & { id?: string }

export const DEFAULT_COLLECTION_PATH = PortfolioStorage.rootCollection

export const UNSUPPORTED_TEST_SOURCE_MESSAGE =
  '[fireux-properties] Portfolio Test source is unsupported: no canonical simulation producer exists.'

export type UsePortfolioCollectionOptions = {
  source?:
    | PortfolioCollectionSource
    | Ref<PortfolioCollectionSource | null | undefined>
    | null
  filter?:
    | PortfolioCollectionFilter
    | Ref<PortfolioCollectionFilter | null | undefined>
    | null
}

export const normalizeString = (value: unknown) => String(value ?? '').trim()

export function resolvePortfolioId(
  portfolio: { id?: unknown } | null | undefined
) {
  return normalizeString(portfolio?.id)
}

export function portfolioRootBelongsToApp(
  portfolio: PortfolioCollectionDoc,
  appId: string
) {
  const state = normalizeFireuxAppScopeState(portfolio.app_scope_state)
  return (
    (state === 'parent_app' || state === 'tenant_app') &&
    normalizeString(portfolio.app_scope_app_id) === appId
  )
}
