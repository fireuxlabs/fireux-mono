import { computed } from 'vue'
import type { WorkspaceTargetOutcome } from 'fireux-core/runtime/composables/fireux/workspace/workspace-outcome'
import { usePropertyAccess } from '../usePropertyAccess'
import { useWorkspace } from 'fireux-core/runtime/composables/fireux/workspace/useWorkspace'
import { usePropertyFetch } from '../firestore/fetch/usePropertyFetch'

export function usePropertyWorkspace() {
  const { selectedId: id } = useWorkspace('property')
  const access = usePropertyAccess()
  const readId = computed(() => access.outcome.value === 'ready' && access.ids.value.includes(id.value) ? id.value : '')
  const source = usePropertyFetch(readId)
  const outcome = computed<WorkspaceTargetOutcome>(() => {
    if (access.outcome.value !== 'ready') return access.outcome.value
    if (!id.value) return 'idle'
    if (!readId.value) return 'missing'
    if (source.outcome.value === 'ready' && source.property.value?.id !== readId.value) return 'pending'
    return source.outcome.value
  })
  const data = computed(() => outcome.value === 'ready' && source.property.value?.id === readId.value ? source.property.value : null)
  return { data, id, outcome }
}
