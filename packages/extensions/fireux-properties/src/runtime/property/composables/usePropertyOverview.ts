import { useOverview } from 'fireux-core/runtime/composables/fireux/useOverview'
import { computed } from 'vue'
import { usePropertyWorkspace } from './workspace/usePropertyWorkspace'
import { usePropertyWorkspaceIndex } from './workspace/usePropertyWorkspaceIndex'

export function usePropertyOverview() {
  const workspace = usePropertyWorkspace()
  const index = usePropertyWorkspaceIndex()
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
    selectedProperty: workspace.data,
    propertyId: workspace.id,
  }
}
