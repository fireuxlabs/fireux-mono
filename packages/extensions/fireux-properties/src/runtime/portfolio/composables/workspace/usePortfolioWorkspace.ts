import { computed, watch } from 'vue'
import {
  useWorkspace,
  defineWorkspace,
} from 'fireux-core/runtime/workspace/composables/useWorkspace'
import { usePortfolioCollection } from '../usePortfolioCollection'
import { usePortfolioAccess } from '../usePortfolioAccess'
import type { WorkspaceTargetOutcome } from 'fireux-core/runtime/workspace/models/outcome'
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
  const readId = computed(() =>
    access.outcome.value === 'ready' && access.ids.value.includes(id.value)
      ? id.value
      : ''
  )
  const source = usePortfolioFetch(readId)
  const outcome = computed<WorkspaceTargetOutcome>(() => {
    if (access.outcome.value !== 'ready') return access.outcome.value
    if (!id.value) return 'idle'
    if (!readId.value) return 'missing'
    if (
      source.outcome.value === 'ready' &&
      source.portfolio.value?.id !== readId.value
    )
      return 'pending'
    return source.outcome.value
  })
  const data = computed(() =>
    outcome.value === 'ready' && source.portfolio.value?.id === readId.value
      ? source.portfolio.value
      : null
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
