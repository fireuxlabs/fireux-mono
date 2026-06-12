import { computed, type Ref } from 'vue'
import type { PortfolioCollectionFilter } from '../../../firestore/portfolio/fetch/usePortfolioCollection'
import { usePortfolioConsole } from '../core/usePortfolioConsole'

type UsePortfolioConsoleIndexOptions = {
  filter?:
    | PortfolioCollectionFilter
    | Ref<PortfolioCollectionFilter | null | undefined>
    | null
}

export function usePortfolioConsoleIndex(
  options: UsePortfolioConsoleIndexOptions = {}
) {
  const {
    targetPortfolios,
    selectedPortfolio,
    portfolioId,
    activePortfolioAppId,
    rootCollection,
    canWrite,
    selectPortfolio,
    clearSelectedPortfolio,
  } = usePortfolioConsole({
    filter: options.filter,
  })
  const selection = computed(() => ({
    portfolio: selectedPortfolio.value,
    portfolioId: portfolioId.value,
  }))
  const sections = computed(() => ({
    targets: {
      show: true,
      collection: targetPortfolios.value,
    },
  }))
  const runtime = computed(() => ({
    appId: activePortfolioAppId.value,
    rootCollection: rootCollection.value,
    canWrite: canWrite.value,
  }))
  const actions = {
    selectTarget: (id: string) => {
      selectPortfolio(String(id ?? '').trim())
    },
    clear: clearSelectedPortfolio,
  }
  const debug = computed(() => ({
    portfolioId: portfolioId.value,
    activePortfolioAppId: activePortfolioAppId.value,
    rootCollection: rootCollection.value,
    canWrite: canWrite.value,
    selectedPortfolio: selectedPortfolio.value,
    targetCount: targetPortfolios.value.length,
  }))

  return {
    selection,
    sections,
    runtime,
    actions,
    debug,
  }
}
