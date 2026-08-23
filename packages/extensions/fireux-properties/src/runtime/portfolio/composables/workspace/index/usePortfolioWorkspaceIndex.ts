// Concurrent edit — 2026-07-19 17:36 CEST — Repo Efficiency Pass 6 of 6: use outcome as target-state authority.
// Concurrent edit — 2026-07-20 16:27 CEST — Workspace Spine pass: compose Portfolio membership outcome before selection validation and bind real target ids.
// Concurrent edit — 2026-07-21 22:31 CEST — Workspace family alignment: consume Portfolio core-owned target authority.
import { computed } from 'vue'
import { useWorkspaceDirectoryIndex } from 'fireux-core/runtime/composables/fireux/workspace/useWorkspaceDirectoryIndex'
import { usePortfolioWorkspace } from '../core/usePortfolioWorkspace'

export function usePortfolioWorkspaceIndex() {
  const {
    portfolios,
    targeting,
    selection: workspaceSelection,
    runtime: workspaceRuntime,
    actions: workspaceActions,
  } = usePortfolioWorkspace()
  const selection = computed(() => ({
    portfolio: workspaceSelection.portfolio.value,
    portfolioId: workspaceSelection.portfolioId.value,
  }))
  const runtime = computed(() => ({
    appId: workspaceRuntime.appId.value,
    rootCollection: workspaceRuntime.rootCollection.value,
    readOnly: workspaceRuntime.readOnly.value,
    canWrite: workspaceRuntime.canWrite.value,
  }))
  const debug = computed(() => ({
    portfolioId: workspaceSelection.portfolioId.value,
    activePortfolioAppId: workspaceRuntime.appId.value,
    rootCollection: workspaceRuntime.rootCollection.value,
    readOnly: workspaceRuntime.readOnly.value,
    canWrite: workspaceRuntime.canWrite.value,
    selectedPortfolio: workspaceSelection.portfolio.value,
    targetCount: portfolios.count.value,
    source: targeting.debug.value,
  }))

  return useWorkspaceDirectoryIndex({
    selection,
    selectedId: computed(() => workspaceSelection.portfolioId.value),
    selectedTarget: workspaceSelection.portfolio,
    runtime,
    targets: portfolios.targets,
    outcome: portfolios.outcome,
    getTargetId: (target) => String(target?.id ?? '').trim(),
    selectTarget: (id: string) => {
      workspaceActions.selectPortfolio(String(id ?? '').trim())
    },
    clearSelection: workspaceActions.clearSelectedPortfolio,
    debug,
  })
}
