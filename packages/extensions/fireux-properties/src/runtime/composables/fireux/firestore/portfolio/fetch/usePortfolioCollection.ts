import { computed } from 'vue'
import { useFirestoreRead } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreRead'
import type { Portfolio } from '../../../../../models/portfolio.model'

export function usePortfolioCollection() {
  const { firestoreFetchCollection } = useFirestoreRead()
  const source = firestoreFetchCollection<Portfolio>('portfolios')

  const collection = computed(() => source.value ?? [])
  const count = computed(() => collection.value.length)

  return {
    collection,
    count,
  }
}
