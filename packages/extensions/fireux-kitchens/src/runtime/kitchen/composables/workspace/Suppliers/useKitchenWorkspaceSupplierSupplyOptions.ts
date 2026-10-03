import { computed } from 'vue'
import { useKitchenWorkspaceSupplier } from './useKitchenWorkspaceSupplier'

export function useKitchenWorkspaceSupplierSupplyOptions() {
  const supplierState = useKitchenWorkspaceSupplier()
  const title = computed(() => `${String(supplierState.supplier.value?.name || supplierState.supplierId.value || 'Supplier')} supply options`)
  return {
    ...supplierState,
    title,
    description: 'Supply options are not connected yet. The supplier catalogue remains available where integrated.',
  }
}
