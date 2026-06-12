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
    portfolios,
    selection: consoleSelection,
    runtime: consoleRuntime,
    actions: consoleActions,
  } = usePortfolioConsole({
    filter: options.filter,
  })
  const selection = computed(() => ({
    portfolio: consoleSelection.portfolio.value,
    portfolioId: consoleSelection.portfolioId.value,
  }))
  const sections = computed(() => ({
    targets: {
      show: true,
      collection: portfolios.targets.value,
      pending: portfolios.pending.value,
    },
  }))
  const runtime = computed(() => ({
    appId: consoleRuntime.appId.value,
    rootCollection: consoleRuntime.rootCollection.value,
    readOnly: consoleRuntime.readOnly.value,
    canWrite: consoleRuntime.canWrite.value,
  }))
  const actions = {
    selectTarget: (id: string) => {
      consoleActions.selectPortfolio(String(id ?? '').trim())
    },
    clear: consoleActions.clearSelectedPortfolio,
  }
  const debug = computed(() => ({
    portfolioId: consoleSelection.portfolioId.value,
    activePortfolioAppId: consoleRuntime.appId.value,
    rootCollection: consoleRuntime.rootCollection.value,
    readOnly: consoleRuntime.readOnly.value,
    canWrite: consoleRuntime.canWrite.value,
    selectedPortfolio: consoleSelection.portfolio.value,
    targetCount: portfolios.count.value,
  }))

  return {
    selection,
    sections,
    runtime,
    actions,
    debug,
  }
}
