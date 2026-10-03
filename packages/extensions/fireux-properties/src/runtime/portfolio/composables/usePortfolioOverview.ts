import { useOverview } from 'fireux-core/runtime/composables/fireux/useOverview'
import { computed } from 'vue'
import { usePortfolioWorkspace } from './workspace/usePortfolioWorkspace'
import { usePortfolioWorkspaceIndex } from './workspace/usePortfolioWorkspaceIndex'

export function usePortfolioOverview() {
  const workspace = usePortfolioWorkspace()
  const index = usePortfolioWorkspaceIndex()
  const { focus } = useOverview({
    entity: workspace.data,
    id: workspace.id,
    outcome: workspace.outcome,
  })
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
  }
}
