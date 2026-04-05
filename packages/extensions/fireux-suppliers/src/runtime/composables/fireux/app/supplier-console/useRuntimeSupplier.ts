import { computed } from 'vue'
import { useSupplierRecord } from '../../firestore/supplier/fetch/useSupplierRecord'
import type { Supplier } from '../../../models/supplier/Supplier.model'
import { useRuntimeSupplierSelection } from './state'
import { getDemoSupplierScenario } from './demo-scenarios'

/**
 * Canon supplier console seam.
 */
export function useRuntimeSupplier() {
  const selection = useRuntimeSupplierSelection()
  const id = selection.selectedId
  const mode = selection.mode
  const activity = computed<'static'>(() => 'static')
  const isDemo = computed(() => selection.mode.value === 'demo')
  const supplierCollectionPath = computed(() =>
    selection.mode.value === 'test' ? 'test-suppliers' : 'suppliers'
  )
  const liveSupplierId = computed(() => (isDemo.value ? '' : id.value))
  const {
    supplier: liveSupplier,
    pending: livePending,
  } = useSupplierRecord(liveSupplierId, {
    collectionPath: supplierCollectionPath,
  })

  const scenario = computed(() =>
    isDemo.value ? getDemoSupplierScenario(id.value) : null
  )

  const supplier = computed<Supplier | null>(() => {
    if (!id.value) return null
    if (isDemo.value) return scenario.value?.supplier ?? null
    return liveSupplier.value ?? null
  })

  const pending = computed(() => !isDemo.value && Boolean(livePending.value))

  return {
    id,
    mode,
    activity,
    isDemo,
    pending,
    scenario,
    supplier,
  }
}
