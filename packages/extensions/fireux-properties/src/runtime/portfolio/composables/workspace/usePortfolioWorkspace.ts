import { useWorkspaceRecord } from 'fireux-workspace/runtime/workspace/composables/useWorkspaceRecord'
import { computed, watch } from 'vue'
import {
  useWorkspace,
  defineWorkspace,
} from 'fireux-workspace/runtime/workspace/composables/useWorkspace'
import { usePortfolioCollection } from '../usePortfolioCollection'
import { usePortfolioAccess } from '../usePortfolioAccess'
import { usePortfolioFetch } from '../firestore/fetch/usePortfolioFetch'

export const usePortfolioWorkspace = defineWorkspace(() => {
  const selection = useWorkspace('portfolio')
  const access = usePortfolioAccess()
  const portfolios = usePortfolioCollection({
    filter: computed(() => ({ ids: access.ids.value })),
  })
  const collectionOutcome = computed(() =>
    access.outcome.value === 'pending' || access.outcome.value === 'error'
      ? access.outcome.value
      : portfolios.outcome.value
  )
  watch(
    [portfolios.portfolios, collectionOutcome, selection.selectedId],
    () =>
      selection.reconcile(
        portfolios.portfolios.value.flatMap((portfolio) =>
          portfolio.id ? [portfolio.id] : []
        ),
        collectionOutcome.value
      ),
    { immediate: true }
  )

  const id = selection.selectedId
  const { data, outcome } = useWorkspaceRecord(
    id,
    access,
    usePortfolioFetch,
    (source) => source.portfolio
  )

  return {
    data,
    id,
    outcome,
    collectionOutcome,
    collection: portfolios.portfolios,
    select: selection.select,
  }
})
