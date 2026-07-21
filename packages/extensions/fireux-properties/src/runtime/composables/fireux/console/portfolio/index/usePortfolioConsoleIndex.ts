// Concurrent edit — 2026-07-19 17:36 CEST — Repo Efficiency Pass 6 of 6: use outcome as target-state authority.
// Concurrent edit — 2026-07-20 16:27 CEST — Console Spine pass: compose Portfolio membership outcome before selection validation and bind real target ids.
// Concurrent edit — 2026-07-21 22:31 CEST — Console family alignment: consume Portfolio core-owned target authority.
import { computed, type Ref } from 'vue'
import { useConsoleIndex } from 'fireux-core/runtime/composables/fireux/app/console/useConsoleIndex'
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
    targeting,
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
    source: targeting.debug.value,
  }))

  return useConsoleIndex({
    selection,
    selectedId: computed(() => consoleSelection.portfolioId.value),
    autoSelectTargetId: computed(() =>
      targeting.singleTargetId.value
    ),
    runtime,
    targets: portfolios.targets,
    outcome: portfolios.outcome,
    getTargetId: (target) => String(target?.id ?? '').trim(),
    selectTarget: (id: string) => {
      consoleActions.selectPortfolio(String(id ?? '').trim())
    },
    clearSelection: consoleActions.clearSelectedPortfolio,
    debug,
  })
}
