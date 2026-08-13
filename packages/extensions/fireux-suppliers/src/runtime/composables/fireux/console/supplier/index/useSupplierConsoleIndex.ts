// Concurrent edit — 2026-07-19 17:36 CEST — Repo Efficiency Pass 6 of 6: use outcome as target-state authority.
// Concurrent edit — 2026-07-20 16:27 CEST — Console Spine pass: compose Supplier membership outcome before selection validation and bind real target ids.
// Concurrent edit — 2026-07-21 22:31 CEST — Console family alignment: consume Supplier core-owned target authority.
import { computed } from 'vue'
import { useConsoleIndex } from 'fireux-core/runtime/composables/fireux/app/console/useConsoleIndex'
import { useSupplierConsole } from '../core/useSupplierConsole'

export function useSupplierConsoleIndex() {
  const {
    suppliers,
    targeting,
    selection: consoleSelection,
    runtime: consoleRuntime,
    actions: consoleActions,
  } = useSupplierConsole()
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
    source: targeting.debug.value,
  }))

  return useConsoleIndex({
    selection,
    selectedId: computed(() => consoleSelection.supplierId.value),
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
