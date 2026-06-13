import { computed, unref, type Ref } from 'vue'
import { useConsoleIndex } from 'fireux-core/runtime/composables/fireux/app/console/useConsoleIndex'
import { useConsoleTargets } from 'fireux-core/runtime/composables/fireux/app/console/useConsoleTargets'
import type { SupplierCollectionFilter } from '../../../firestore/supplier/fetch/useSupplierCollection'
import { useSupplierConsole } from '../core/useSupplierConsole'

type UseSupplierConsoleIndexOptions = {
  filter?: SupplierCollectionFilter | Ref<SupplierCollectionFilter | null | undefined> | null
}

export function useSupplierConsoleIndex(
  options: UseSupplierConsoleIndexOptions = {}
) {
  const consoleTargets = useConsoleTargets({ family: 'supplier' })
  const targetFilter = computed<SupplierCollectionFilter>(() => {
    const explicit = options.filter ? unref(options.filter) ?? {} : {}

    return consoleTargets.filter(explicit)
  })
  const {
    suppliers,
    selection: consoleSelection,
    runtime: consoleRuntime,
    actions: consoleActions,
  } = useSupplierConsole({
    filter: targetFilter,
  })
  const selection = computed(() => ({
    supplier: consoleSelection.supplier.value,
    supplierId: consoleSelection.supplierId.value,
  }))
  const runtime = computed(() => ({
    appId: consoleRuntime.appId.value,
    rootCollection: consoleRuntime.rootCollection.value,
    readOnly: consoleRuntime.readOnly.value,
    canWrite: consoleRuntime.canWrite.value,
  }))
  const debug = computed(() => ({
    supplierId: consoleSelection.supplierId.value,
    activeSupplierAppId: consoleRuntime.appId.value,
    rootCollection: consoleRuntime.rootCollection.value,
    readOnly: consoleRuntime.readOnly.value,
    canWrite: consoleRuntime.canWrite.value,
    selectedSupplier: consoleSelection.supplier.value,
    targetCount: suppliers.count.value,
    source: consoleTargets.debug.value,
  }))

  return useConsoleIndex({
    selection,
    selectedId: computed(() => consoleSelection.supplierId.value),
    autoSelectTargetId: computed(() =>
      consoleTargets.singleTargetId.value
    ),
    runtime,
    targets: suppliers.targets,
    pending: suppliers.pending,
    selectTarget: (id: string) => {
      consoleActions.selectSupplier(String(id ?? '').trim())
    },
    clearSelection: consoleActions.clearSelectedSupplier,
    debug,
  })
}
