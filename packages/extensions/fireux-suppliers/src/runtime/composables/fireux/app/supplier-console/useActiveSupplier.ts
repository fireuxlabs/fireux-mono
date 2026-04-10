import { computed } from 'vue'
import { useSupplierFetch } from '../../firestore/supplier/fetch/useSupplierFetch'
import { useSupplierSelection } from './useSupplierSelection'

/**
 * Live supplier loader.
 * Loads the selected supplier document from `suppliers/<id>`.
 */
export function useActiveSupplier() {
  const { selectedId: id } = useSupplierSelection()
  const { supplier: liveSupplier, pending } = useSupplierFetch(id)

  const supplier = computed(() => {
    if (!id.value) return null
    return liveSupplier.value ?? null
  })

  return {
    id,
    supplier,
    pending,
  }
}
