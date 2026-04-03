import { computed } from 'vue'
import { useSupplierRecord } from '../../firestore/supplier/fetch/useSupplierRecord'
import type { Supplier } from '../../../models/supplier/Supplier.model'
import { useRuntimeSupplierSelection } from './state'
import { getReadOnlySupplierScenario } from './read-only-scenarios'

/**
 * Canon supplier console seam.
 */
export function useRuntimeSupplier() {
  const selection = useRuntimeSupplierSelection()
  const id = selection.selectedId
  const readOnly = computed(() => selection.mode.value === 'read-only')
  const supplierCollectionPath = computed(() =>
    selection.mode.value === 'test' ? 'test-suppliers' : 'suppliers'
  )
  const liveSupplierId = computed(() => (readOnly.value ? '' : id.value))
  const {
    supplier: liveSupplier,
    pending: livePending,
  } = useSupplierRecord(liveSupplierId, {
    collectionPath: supplierCollectionPath,
  })

  const scenario = computed(() =>
    readOnly.value ? getReadOnlySupplierScenario(id.value) : null
  )

  const supplier = computed<Supplier | null>(() => {
    if (!id.value) return null
    if (readOnly.value) return scenario.value?.supplier ?? null
    return liveSupplier.value ?? null
  })

  const pending = computed(() => !readOnly.value && Boolean(livePending.value))

  return {
    id,
    pending,
    scenario,
    supplier,
  }
}
