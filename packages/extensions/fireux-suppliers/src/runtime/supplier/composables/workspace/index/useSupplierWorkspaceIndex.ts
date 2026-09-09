import { computed, watch } from 'vue'
import { useWorkspace } from 'fireux-core/runtime/composables/fireux/workspace/useWorkspace'
import { useSupplierCollection } from '../../useSupplierCollection'
import { useSupplierWorkspaceAccess } from '../core/useSupplierWorkspaceAccess'

export function useSupplierWorkspaceIndex() {
  const workspace = useWorkspace('supplier')
  const access = useSupplierWorkspaceAccess()
  const suppliers = useSupplierCollection({
    filter: computed(() => ({ ids: access.ids.value })),
  })
  const outcome = computed(() =>
    access.outcome.value === 'pending' || access.outcome.value === 'error'
      ? access.outcome.value
      : suppliers.outcome.value
  )
  watch(
    [suppliers.suppliers, outcome, workspace.selectedId],
    () =>
      workspace.reconcile(
        suppliers.suppliers.value.flatMap((supplier) =>
          supplier.id ? [supplier.id] : []
        ),
        outcome.value
      ),
    { immediate: true }
  )
  return {
    outcome,
    collection: suppliers.suppliers,
    selectedId: workspace.selectedId,
    select: workspace.select,
    clear: workspace.clear,
  }
}
