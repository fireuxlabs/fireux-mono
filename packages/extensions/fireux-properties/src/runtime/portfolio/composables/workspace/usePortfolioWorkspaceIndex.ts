import { computed, watch } from 'vue'
import { useWorkspace } from 'fireux-core/runtime/composables/fireux/workspace/useWorkspace'
import { usePortfolioCollection } from '../usePortfolioCollection'
import { usePortfolioAccess } from '../usePortfolioAccess'

export function usePortfolioWorkspaceIndex() {
  const workspace = useWorkspace('portfolio')
  const access = usePortfolioAccess()
  const portfolios = usePortfolioCollection({
    filter: computed(() => ({ ids: access.ids.value })),
  })
  const outcome = computed(() =>
    access.outcome.value === 'pending' || access.outcome.value === 'error'
      ? access.outcome.value
      : portfolios.outcome.value
  )
  watch(
    [portfolios.portfolios, outcome, workspace.selectedId],
    () =>
      workspace.reconcile(
        portfolios.portfolios.value.flatMap((portfolio) =>
          portfolio.id ? [portfolio.id] : []
        ),
        outcome.value
      ),
    { immediate: true }
  )
  return {
    outcome,
    collection: portfolios.portfolios,
    selectedId: workspace.selectedId,
    select: workspace.select,
  }
}
