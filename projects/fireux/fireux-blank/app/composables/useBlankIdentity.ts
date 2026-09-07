import { computed } from 'vue'
import { useIdentity } from 'fireux-core/runtime/composables/fireux/useIdentity'
import { useBlankWorkspace } from './fireux/workspace/blank/core/useBlankWorkspace'

export function useBlankIdentity() {
  const workspace = useBlankWorkspace()
  const fields = computed(() => ({ name: workspace.data.value?.name || '' }))
  const state = useIdentity({
    id: workspace.id,
    fields,
    status: workspace.outcome,
    canWrite: computed(() => false),
  })
  return { ...state, fields, selectedBlank: workspace.data, blankId: workspace.id }
}
