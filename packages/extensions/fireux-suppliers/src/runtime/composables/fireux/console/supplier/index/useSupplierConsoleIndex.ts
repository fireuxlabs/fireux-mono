import { computed, type Ref } from 'vue'
import type { SupplierCollectionFilter } from '../../../firestore/supplier/fetch/useSupplierCollection'
import { useSupplierConsole } from '../core/useSupplierConsole'

type UseSupplierConsoleIndexOptions = {
  filter?: SupplierCollectionFilter | Ref<SupplierCollectionFilter | null | undefined> | null
}

export function useSupplierConsoleIndex(
  options: UseSupplierConsoleIndexOptions = {}
) {
  const {
    targetSuppliers,
    selectedSupplier,
    supplierId,
    activeSupplierAppId,
    rootCollection,
    canWrite,
    selectSupplier,
    clearSelectedSupplier,
  } = useSupplierConsole({
    filter: options.filter,
  })
  const selection = computed(() => ({
    supplier: selectedSupplier.value,
    supplierId: supplierId.value,
  }))
  const sections = computed(() => ({
    targets: {
      show: true,
      collection: targetSuppliers.value,
    },
  }))
  const runtime = computed(() => ({
    appId: activeSupplierAppId.value,
    rootCollection: rootCollection.value,
    canWrite: canWrite.value,
  }))
  const actions = {
    selectTarget: (id: string) => {
      selectSupplier(String(id ?? '').trim())
    },
    clear: clearSelectedSupplier,
  }
  const debug = computed(() => ({
    supplierId: supplierId.value,
    activeSupplierAppId: activeSupplierAppId.value,
    rootCollection: rootCollection.value,
    canWrite: canWrite.value,
    selectedSupplier: selectedSupplier.value,
    targetCount: targetSuppliers.value.length,
  }))

  return {
    selection,
    sections,
    runtime,
    actions,
    debug,
  }
}
