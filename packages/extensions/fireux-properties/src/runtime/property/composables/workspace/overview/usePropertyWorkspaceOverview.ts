import { computed } from 'vue'
import { usePropertyWorkspace } from '../core/usePropertyWorkspace'
import { usePropertyWorkspaceIndex } from '../index/usePropertyWorkspaceIndex'

export function usePropertyWorkspaceOverview() {
  const workspace = usePropertyWorkspace()
  const index = usePropertyWorkspaceIndex()
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
    selectedProperty: workspace.data,
    propertyId: workspace.id,
    clearSelectedProperty: index.clear,
  }
}
