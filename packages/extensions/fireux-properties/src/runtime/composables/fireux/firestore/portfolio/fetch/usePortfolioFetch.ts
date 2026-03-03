import { computed } from 'vue'
import { usePortfolioCollection } from './usePortfolioCollection'

export function usePortfolioFetch(options: { collectionPath?: string } = {}) {
  const { collection } = usePortfolioCollection(options)

  const portfolios = computed(() => collection.value ?? [])

  return {
    portfolios,
  }
}
