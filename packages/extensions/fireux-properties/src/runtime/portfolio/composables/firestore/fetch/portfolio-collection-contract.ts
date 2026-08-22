import type { Ref } from 'vue'
import type { WorkspaceSource } from 'fireux-core/runtime/composables/fireux/workspace/useWorkspace'
import {
  PortfolioStorage,
  type Portfolio,
} from '../../../models/portfolio.model.ts'
import type {
  TargetCollectionFilter,
  TargetCollectionFilterValue,
} from '../../../../composables/fireux/firestore/collection-selection'

export type PortfolioCollectionFilterValue = TargetCollectionFilterValue
export type PortfolioCollectionFilter = TargetCollectionFilter
export type PortfolioCollectionSource = WorkspaceSource
export type PortfolioCollectionDoc = Partial<Portfolio> & {
  id?: string
}

export type PortfolioCollectionItem = Portfolio

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
