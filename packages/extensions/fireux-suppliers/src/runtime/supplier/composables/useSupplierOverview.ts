import { useOverview } from 'fireux-core/runtime/composables/fireux/useOverview'
import { computed } from 'vue'
import { useSupplierWorkspace } from './workspace/useSupplierWorkspace'
import { useSupplierWorkspaceIndex } from './workspace/useSupplierWorkspaceIndex'

export function useSupplierOverview() {
  const workspace = useSupplierWorkspace()
  const index = useSupplierWorkspaceIndex()
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
    selectedSupplier: workspace.data,
    supplierId: workspace.id,
  }
}
