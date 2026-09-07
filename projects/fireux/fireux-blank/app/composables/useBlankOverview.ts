import { useOverview } from 'fireux-core/runtime/composables/fireux/useOverview'
import { computed } from 'vue'
import { useBlankWorkspace } from './fireux/workspace/blank/core/useBlankWorkspace'
import { useBlankWorkspaceIndex } from './fireux/workspace/blank/index/useBlankWorkspaceIndex'

export function useBlankOverview() {
  const workspace = useBlankWorkspace()
  const index = useBlankWorkspaceIndex()
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
    selectedBlank: workspace.data,
    blankId: workspace.id,
    clearSelectedBlank: index.clear,
  }
}
