// Concurrent edit — 2026-07-19 17:36 CEST — Repo Efficiency Pass 6 of 6: use outcome as target-state authority.
// Concurrent edit — 2026-07-20 16:27 CEST — Console Spine pass: compose Supplier membership outcome before selection validation and bind real target ids.
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
    resolveTargetOutcome: consoleTargets.resolveOutcome,
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
    outcome: suppliers.outcome,
    getTargetId: (target) => String(target?.id ?? '').trim(),
    selectTarget: (id: string) => {
      consoleActions.selectSupplier(String(id ?? '').trim())
    },
    clearSelection: consoleActions.clearSelectedSupplier,
    debug,
  })
}
