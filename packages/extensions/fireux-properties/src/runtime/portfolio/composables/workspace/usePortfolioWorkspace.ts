import { computed } from 'vue'
import type { WorkspaceTargetOutcome } from 'fireux-core/runtime/composables/fireux/workspace/workspace-outcome'
import { usePortfolioAccess } from '../usePortfolioAccess'
import { useWorkspace } from 'fireux-core/runtime/composables/fireux/workspace/useWorkspace'
import { usePortfolioFetch } from '../firestore/fetch/usePortfolioFetch'

export function usePortfolioWorkspace() {
  const { selectedId: id } = useWorkspace('portfolio')
  const access = usePortfolioAccess()
  const readId = computed(() => access.outcome.value === 'ready' && access.ids.value.includes(id.value) ? id.value : '')
  const source = usePortfolioFetch(readId)
  const outcome = computed<WorkspaceTargetOutcome>(() => {
    if (access.outcome.value !== 'ready') return access.outcome.value
    if (!id.value) return 'idle'
    if (!readId.value) return 'missing'
    if (source.outcome.value === 'ready' && source.portfolio.value?.id !== readId.value) return 'pending'
    return source.outcome.value
  })
  const data = computed(() => outcome.value === 'ready' && source.portfolio.value?.id === readId.value ? source.portfolio.value : null)
  return { data, id, outcome }
}
