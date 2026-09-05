import { computed } from 'vue'
import { useBlankWorkspace } from '../core/useBlankWorkspace'
import { useBlankWorkspaceIndex } from '../index/useBlankWorkspaceIndex'

export function useBlankWorkspaceOverview() {
  const workspace = useBlankWorkspace()
  const index = useBlankWorkspaceIndex()
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
    selectedBlank: workspace.data,
    blankId: workspace.id,
    clearSelectedBlank: index.clear,
  }
}
