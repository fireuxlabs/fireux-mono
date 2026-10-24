import { computed, watch } from 'vue'
import { useWorkspace } from 'fireux-core/runtime/workspace/composables/useWorkspace'
import { useSupplierCollection } from '../useSupplierCollection'
import { useSupplierAccess } from '../useSupplierAccess'

export function useSupplierWorkspaceIndex() {
  const workspace = useWorkspace('supplier')
  const access = useSupplierAccess()
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
  }
}
