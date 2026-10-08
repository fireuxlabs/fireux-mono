import { computed } from 'vue'
import { useFirestoreRead } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreRead'
import { useFirestoreCollectionState } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreCollection'
import { useTargetCollectionSelection } from '../../composables/fireux/firestore/collection-selection'
import type { Portfolio } from '../models/portfolio.model.ts'
import { normalizePortfolio } from '../utils/normalize-portfolio'
import {
  DEFAULT_COLLECTION_PATH,
  UNSUPPORTED_TEST_SOURCE_MESSAGE,
  resolvePortfolioId,
  type PortfolioCollectionDoc,
  type UsePortfolioCollectionOptions,
} from './firestore/fetch/portfolio-collection-contract'

export type {
  PortfolioCollectionFilter,
  PortfolioCollectionFilterValue,
  PortfolioCollectionSource,
} from './firestore/fetch/portfolio-collection-contract'

export function usePortfolioCollection(
  options: UsePortfolioCollectionOptions = {}
) {
  const { sourceMode, hasFilter, filterIdSet, hasOperatorFilter } =
    useTargetCollectionSelection(options, 'live')
  const { firestoreFetchCollection, firestoreLoadDocsByIds } =
    useFirestoreRead()
  const targeted = computed(() => hasFilter.value || hasOperatorFilter.value)
  const collection = firestoreFetchCollection<PortfolioCollectionDoc>(
    computed(() =>
      sourceMode.value === 'live' && !targeted.value
        ? DEFAULT_COLLECTION_PATH
        : ''
    )
  )
  const documents = firestoreLoadDocsByIds<PortfolioCollectionDoc>({
    collectionPath: computed(() =>
      sourceMode.value === 'live' && targeted.value
        ? DEFAULT_COLLECTION_PATH
        : ''
    ),
    ids: computed(() => [...filterIdSet.value]),
  })
  const source = computed(() =>
    targeted.value ? (documents.docs.value ?? []) : (collection.value ?? [])
  )
  const parsed = computed(() => {
    const items: Portfolio[] = [], invalidIds: string[] = []
    for (const portfolio of source.value) {
      const id = resolvePortfolioId(portfolio)
      if (id && hasFilter.value && !filterIdSet.value.has(id)) continue
      const item = normalizePortfolio(id, portfolio)
      if (item) items.push(item)
      else invalidIds.push(id || '(missing-id)')
    }
    return { items, invalidIds }
  })
  const pending = computed(() =>
    sourceMode.value === 'live'
      ? targeted.value
        ? documents.pending.value
        : collection.pending.value
      : false
  )
  const error = computed<unknown | undefined>(() => {
    if (sourceMode.value === 'demo') return undefined
    if (sourceMode.value === 'test') {
      return new Error(UNSUPPORTED_TEST_SOURCE_MESSAGE)
    }
    const bindingError = targeted.value ? documents.error.value : collection.error.value
    if (bindingError) return bindingError
    if (parsed.value.invalidIds.length)
      return new Error(`[fireux-properties] Invalid Portfolio root(s): ${parsed.value.invalidIds.join(', ')}`)
    return undefined
  })
  const { outcome } = useFirestoreCollectionState({
    active: computed(() => sourceMode.value === 'live'),
    count: computed(() => parsed.value.items.length), error, pending,
  })
  const portfolios = computed(() => outcome.value === 'ready' ? parsed.value.items : [])
  const count = computed(() => portfolios.value.length)

  return { portfolios, count, pending, error, outcome }
}
