// Concurrent edit — 2026-07-20 16:26 CEST — Workspace Spine pass: carry Portfolio target outcome into overview.
import { computed } from 'vue'
import { normalizeString } from 'fireux-core/runtime/utils/string'
import { usePortfolioWorkspace } from '../core/usePortfolioWorkspace'

export function usePortfolioWorkspaceOverview() {
  const { portfolios, selection, runtime, actions } = usePortfolioWorkspace()

  const focus = computed(() => ({
    entity: selection.portfolio.value,
    id: normalizeString(selection.portfolio.value?.id),
    hasSelection: Boolean(selection.portfolio.value),
    outcome: portfolios.outcome.value,
  }))
  const multiple = computed(() => ({
    items: portfolios.targets.value,
    count: portfolios.count.value,
    hasItems: portfolios.count.value > 0,
    outcome: portfolios.outcome.value,
  }))
  const debug = computed(() => ({
    portfolioId: selection.portfolioId.value,
    activePortfolioAppId: runtime.appId.value,
    rootCollection: runtime.rootCollection.value,
    readOnly: runtime.readOnly.value,
    canWrite: runtime.canWrite.value,
    focus: focus.value,
    multiple: {
      count: multiple.value.count,
      ids: multiple.value.items.map((item) =>
        normalizeString(item?.id)
      ),
    },
  }))

  return {
    focus,
    multiple,
    outcome: portfolios.outcome,
    selectedPortfolio: selection.portfolio,
    portfolioId: selection.portfolioId,
    activePortfolioAppId: runtime.appId,
    rootCollection: runtime.rootCollection,
    readOnly: runtime.readOnly,
    canWrite: runtime.canWrite,
    clearSelectedPortfolio: actions.clearSelectedPortfolio,
    debug,
  }
}
