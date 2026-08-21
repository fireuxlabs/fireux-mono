import { computed } from 'vue'
import { useFirestoreRead } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreRead'
import { useFirestoreCollectionState } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreCollection'
import { useTargetCollectionSelection } from '../../../../composables/fireux/firestore/collection-selection'
import { usePortfolioInterface } from '../utils/view/usePortfolioInterface'
import {
  DEFAULT_COLLECTION_PATH,
  UNSUPPORTED_TEST_SOURCE_MESSAGE,
  resolvePortfolioId,
  type PortfolioCollectionDoc,
  type PortfolioCollectionItem,
  type UsePortfolioCollectionOptions,
} from './portfolio-collection-contract'

export type {
  PortfolioCollectionFilter,
  PortfolioCollectionFilterValue,
  PortfolioCollectionSource,
} from './portfolio-collection-contract'

export function usePortfolioCollection(
  options: UsePortfolioCollectionOptions = {}
) {
  const { sourceMode, hasFilter, filterIdSet, hasOperatorFilter } =
    useTargetCollectionSelection(options, 'live')
  const { firestoreFetchCollection, firestoreLoadDocsByIds } =
    useFirestoreRead()
  const { surface } = usePortfolioInterface()
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
  const portfolios = computed<PortfolioCollectionItem[]>(() =>
    source.value.reduce<PortfolioCollectionItem[]>((items, portfolio) => {
      const id = resolvePortfolioId(portfolio)
      if (!id || (hasFilter.value && !filterIdSet.value.has(id))) return items
      const item = surface({ portfolio: { ...portfolio, id } })
      if (item) items.push(item)
      return items
    }, [])
  )
  const count = computed(() => portfolios.value.length)
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
    return targeted.value ? documents.error.value : collection.error.value
  })
  const { outcome } = useFirestoreCollectionState({ count, error, pending })

  return { portfolios, count, pending, error, outcome }
}
