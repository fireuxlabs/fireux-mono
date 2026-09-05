import { computed } from 'vue'
import { usePortfolioWorkspace } from '../core/usePortfolioWorkspace'
import { usePortfolioWorkspaceIndex } from '../index/usePortfolioWorkspaceIndex'

export function usePortfolioWorkspaceOverview() {
  const workspace = usePortfolioWorkspace()
  const index = usePortfolioWorkspaceIndex()
  const focus = computed(() => ({
    entity: workspace.data.value,
    id: workspace.id.value,
    hasSelection: Boolean(workspace.data.value),
    outcome: workspace.outcome.value,
  }))
  const multiple = computed(() => ({
    items: index.collection.value,
    count: index.collection.value.length,
    hasItems: index.collection.value.length > 0,
    outcome: index.outcome.value,
  }))

  return {
    focus,
    multiple,
    outcome: workspace.outcome,
    selectedPortfolio: workspace.data,
    portfolioId: workspace.id,
    clearSelectedPortfolio: index.clear,
  }
}
