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
    suppliers,
    selection: consoleSelection,
    runtime: consoleRuntime,
    actions: consoleActions,
  } = useSupplierConsole({
    filter: options.filter,
  })
  const selection = computed(() => ({
    supplier: consoleSelection.supplier.value,
    supplierId: consoleSelection.supplierId.value,
  }))
  const sections = computed(() => ({
    targets: {
      show: true,
      collection: suppliers.targets.value,
      pending: suppliers.pending.value,
    },
  }))
  const runtime = computed(() => ({
    appId: consoleRuntime.appId.value,
    rootCollection: consoleRuntime.rootCollection.value,
    readOnly: consoleRuntime.readOnly.value,
    canWrite: consoleRuntime.canWrite.value,
  }))
  const actions = {
    selectTarget: (id: string) => {
      consoleActions.selectSupplier(String(id ?? '').trim())
    },
    clear: consoleActions.clearSelectedSupplier,
  }
  const debug = computed(() => ({
    supplierId: consoleSelection.supplierId.value,
    activeSupplierAppId: consoleRuntime.appId.value,
    rootCollection: consoleRuntime.rootCollection.value,
    readOnly: consoleRuntime.readOnly.value,
    canWrite: consoleRuntime.canWrite.value,
    selectedSupplier: consoleSelection.supplier.value,
    targetCount: suppliers.count.value,
  }))

  return {
    selection,
    sections,
    runtime,
    actions,
    debug,
  }
}
