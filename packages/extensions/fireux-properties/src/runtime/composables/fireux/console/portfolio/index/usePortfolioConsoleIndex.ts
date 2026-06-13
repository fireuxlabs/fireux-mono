import { computed, unref, type Ref } from 'vue'
import {
  useConsoleIndex,
  useConsoleIndexSource,
} from 'fireux-core/runtime/composables/fireux/app/console/useConsoleIndex'
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
  const source = useConsoleIndexSource({ family: 'portfolio' })
  const targetFilter = computed<PortfolioCollectionFilter>(() => {
    const explicit = options.filter ? unref(options.filter) ?? {} : {}

    return source.isTenant.value
      ? { ...explicit, ids: source.targetIds.value }
      : explicit
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
    source: source.debug.value,
  }))

  return useConsoleIndex({
    selection,
    selectedId: computed(() => consoleSelection.portfolioId.value),
    autoSelectTargetId: computed(() =>
      source.isSingleTenantTarget.value ? source.targetIds.value[0] ?? '' : ''
    ),
    runtime,
    targets: portfolios.targets,
    pending: portfolios.pending,
    selectTarget: (id: string) => {
      consoleActions.selectPortfolio(String(id ?? '').trim())
    },
    clearSelection: consoleActions.clearSelectedPortfolio,
    debug,
  })
}
