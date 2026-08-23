// Concurrent edit — 2026-07-19 17:36 CEST — Repo Efficiency Pass 6 of 6: use outcome as target-state authority.
// Concurrent edit — 2026-07-20 16:27 CEST — Workspace Spine pass: compose Portfolio membership outcome before selection validation and bind real target ids.
// Concurrent edit — 2026-07-21 22:31 CEST — Workspace family alignment: consume Portfolio core-owned target authority.
import { computed } from 'vue'
import { usePortfolioWorkspace } from '../core/usePortfolioWorkspace'

export function usePortfolioWorkspaceIndex() {
  const {
    portfolios,
    selection: workspaceSelection,
    runtime: workspaceRuntime,
    actions: workspaceActions,
  } = usePortfolioWorkspace()
  const debug = computed(() => ({
    portfolioId: workspaceSelection.portfolioId.value,
    activePortfolioAppId: workspaceRuntime.appId.value,
    rootCollection: workspaceRuntime.rootCollection.value,
    readOnly: workspaceRuntime.readOnly.value,
    canWrite: workspaceRuntime.canWrite.value,
    selectedPortfolio: workspaceSelection.portfolio.value,
    targetCount: portfolios.count.value,
  }))

  return {
    portfolio: workspaceSelection.portfolio,
    portfolioId: workspaceSelection.portfolioId,
    portfolios: portfolios.targets,
    outcome: portfolios.outcome,
    selectPortfolio: workspaceActions.selectPortfolio,
    clearPortfolio: workspaceActions.clearSelectedPortfolio,
    debug,
  }
}
