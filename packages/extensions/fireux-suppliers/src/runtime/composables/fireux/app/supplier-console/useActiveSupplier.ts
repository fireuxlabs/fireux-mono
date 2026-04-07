import { computed } from 'vue'
import { useSupplierRecord } from '../../firestore/supplier/fetch/useSupplierRecord'
import { useSupplierSelection } from './useSupplierSelection'

/**
 * Live supplier loader.
 * Loads the selected supplier document from `suppliers/<id>`.
 */
export function useActiveSupplier() {
  const { selectedId: id } = useSupplierSelection()
  const { supplier: liveSupplier, pending } = useSupplierRecord(id)
  const supplier = computed(() => {
    if (!id.value) return null
    return liveSupplier.value ?? null
  })

  return {
    id,
    pending,
    supplier,
  }
}
