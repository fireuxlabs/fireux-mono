import { computed } from 'vue'
import { useWorkspaceIdentity } from 'fireux-core/runtime/workspace/composables/useWorkspaceIdentity'
import { useBlankWorkspace } from './useBlankWorkspace'

export function useBlankWorkspaceIdentity() {
  const workspace = useBlankWorkspace()
  const fields = computed(() => ({ name: workspace.data.value?.name || '' }))
  const state = useWorkspaceIdentity({
    id: workspace.id,
    fields,
    status: workspace.outcome,
    canWrite: computed(() => false),
  })
  return {
    ...state,
    fields,
    selectedBlank: workspace.data,
    blankId: workspace.id,
  }
}
