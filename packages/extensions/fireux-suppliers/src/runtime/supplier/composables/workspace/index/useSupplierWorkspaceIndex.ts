import { computed } from 'vue'
import { useWorkspace } from 'fireux-core/runtime/composables/fireux/workspace/useWorkspace'
import { useSupplierCollection } from '../../firestore/fetch/useSupplierCollection'
import { useSupplierWorkspaceAccess } from '../core/useSupplierWorkspaceAccess'

export function useSupplierWorkspaceIndex() {
  const workspace = useWorkspace('supplier')
  const access = useSupplierWorkspaceAccess()
  const suppliers = useSupplierCollection({ filter: computed(() => ({ ids: access.ids.value })) })
  const outcome = computed(() => access.outcome.value === 'pending' || access.outcome.value === 'error'
    ? access.outcome.value
    : suppliers.outcome.value)
  return { outcome, collection: suppliers.suppliers, selectedId: workspace.selectedId, select: workspace.select, clear: workspace.clear }
}
