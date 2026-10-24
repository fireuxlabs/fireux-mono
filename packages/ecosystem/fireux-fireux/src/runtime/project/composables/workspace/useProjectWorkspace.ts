import { computed } from 'vue'
import type { WorkspaceTargetOutcome } from 'fireux-core/runtime/workspace/models/outcome'
import { useProjectAccess } from '../useProjectAccess'
import { useWorkspace } from 'fireux-core/runtime/workspace/composables/useWorkspace'
import { useProjectRead } from '../useProjectRead'
import { useProjectUpdate } from '../useProjectUpdate'

export function useProjectWorkspace() {
  const { selectedId: id } = useWorkspace('project')
  const update = useProjectUpdate(id)
  const access = useProjectAccess()
  const readId = computed(() => access.outcome.value === 'ready' && access.ids.value.includes(id.value) ? id.value : '')
  const source = useProjectRead(readId)
  const outcome = computed<WorkspaceTargetOutcome>(() => {
    if (access.outcome.value !== 'ready') return access.outcome.value
    if (!id.value) return 'idle'
    if (!readId.value) return 'missing'
    if (source.outcome.value === 'ready' && source.data.value?.id !== readId.value) return 'pending'
    return source.outcome.value
  })
  const data = computed(() => outcome.value === 'ready' && source.data.value?.id === readId.value ? source.data.value : null)

  return {
    data,
    id,
    outcome,
    crud: { update: update.updateProject },
  }
}
