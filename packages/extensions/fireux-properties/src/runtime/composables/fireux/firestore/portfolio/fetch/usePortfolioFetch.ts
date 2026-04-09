import { computed } from 'vue'
import { useCollectionById } from 'fireux-core/runtime/composables/shared/useCollectionById'
import { usePortfolioCollection } from './usePortfolioCollection'

export function usePortfolioFetch(options: { collectionPath?: string } = {}) {
  const { collection, pending } = usePortfolioCollection(options)

  const portfolios = computed(() => collection.value ?? [])
  const { byId: portfolio } = useCollectionById(portfolios)

  return {
    portfolios,
    portfolio,
    pending,
  }
}
