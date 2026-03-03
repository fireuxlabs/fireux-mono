import { computed } from 'vue'
import { useFirestoreRead } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreRead'
import type { Portfolio } from '../../../../../models/portfolio.model'

type UsePortfolioCollectionOptions = {
  collectionPath?: string
}

export function usePortfolioCollection(options: UsePortfolioCollectionOptions = {}) {
  const collectionPath = String(options.collectionPath || 'portfolios').trim() || 'portfolios'
  const { firestoreFetchCollection } = useFirestoreRead()
  const source = firestoreFetchCollection<Portfolio>(collectionPath)

  const collection = computed(() => source.value ?? [])
  const count = computed(() => collection.value.length)

  return {
    collection,
    count,
  }
}
