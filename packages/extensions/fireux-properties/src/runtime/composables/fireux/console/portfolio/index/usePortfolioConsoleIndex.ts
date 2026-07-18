import { computed, unref, type Ref } from 'vue'
import { useConsoleIndex } from 'fireux-core/runtime/composables/fireux/app/console/useConsoleIndex'
import { useConsoleTargets } from 'fireux-core/runtime/composables/fireux/app/console/useConsoleTargets'
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
  const consoleTargets = useConsoleTargets({ family: 'portfolio' })
  const targetFilter = computed<PortfolioCollectionFilter>(() => {
    const explicit = options.filter ? unref(options.filter) ?? {} : {}

    return consoleTargets.filter(explicit)
  })
  const {
    portfolios,
    selection: consoleSelection,
    runtime: consoleRuntime,
    actions: consoleActions,
  } = usePortfolioConsole({
    filter: targetFilter,
  })
  const selection = computed(() => ({
    portfolio: consoleSelection.portfolio.value,
    portfolioId: consoleSelection.portfolioId.value,
  }))
  const runtime = computed(() => ({
    appId: consoleRuntime.appId.value,
    rootCollection: consoleRuntime.rootCollection.value,
    readOnly: consoleRuntime.readOnly.value,
    canWrite: consoleRuntime.canWrite.value,
  }))
  const debug = computed(() => ({
    portfolioId: consoleSelection.portfolioId.value,
    activePortfolioAppId: consoleRuntime.appId.value,
    rootCollection: consoleRuntime.rootCollection.value,
    readOnly: consoleRuntime.readOnly.value,
    canWrite: consoleRuntime.canWrite.value,
    selectedPortfolio: consoleSelection.portfolio.value,
    targetCount: portfolios.count.value,
    source: consoleTargets.debug.value,
  }))

  return useConsoleIndex({
    selection,
    selectedId: computed(() => consoleSelection.portfolioId.value),
    autoSelectTargetId: computed(() =>
      consoleTargets.singleTargetId.value
    ),
    runtime,
    targets: portfolios.targets,
    pending: portfolios.pending,
    outcome: portfolios.outcome,
    selectTarget: (id: string) => {
      consoleActions.selectPortfolio(String(id ?? '').trim())
    },
    clearSelection: consoleActions.clearSelectedPortfolio,
    debug,
  })
}
