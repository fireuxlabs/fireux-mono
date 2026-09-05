import { computed } from 'vue'
import { useSupplierWorkspace } from '../core/useSupplierWorkspace'
import { useSupplierWorkspaceIndex } from '../index/useSupplierWorkspaceIndex'

export function useSupplierWorkspaceOverview() {
  const workspace = useSupplierWorkspace()
  const index = useSupplierWorkspaceIndex()
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
    selectedSupplier: workspace.data,
    supplierId: workspace.id,
    clearSelectedSupplier: index.clear,
  }
}
