import { computed } from 'vue'
import { useSupplierFetch } from '../../firestore/supplier/fetch/useSupplierFetch'
import { getDemoSupplier } from './demo-scenarios'
import { useSupplierSelection } from './useSupplierSelection'

/**
 * Supplier loader.
 * Resolves the selected supplier as the console uses it:
 * - demo scenario when in demo mode
 * - otherwise live supplier document
 */
export function useActiveSupplier() {
  const { selectedId: id, mode } = useSupplierSelection()
  const isDemo = computed(() => mode.value === 'demo')
  const firestoreSupplierId = computed(() => (isDemo.value ? '' : id.value))
  const { supplier: liveSupplier, pending: livePending } =
    useSupplierFetch(firestoreSupplierId)

  const scenario = computed(() => {
    if (!isDemo.value || !id.value) return null
    return getDemoSupplier(id.value)
  })

  const entity = computed(() => {
    if (!id.value) return null
    if (isDemo.value) return scenario.value?.supplier ?? null
    return liveSupplier.value ?? null
  })

  const pending = computed(() => {
    if (!id.value) return false
    if (isDemo.value) return false
    return livePending.value
  })

  return {
    id,
    mode,
    isDemo,
    entity,
    scenario,
    pending,
  }
}
