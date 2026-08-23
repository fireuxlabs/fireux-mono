// Concurrent edit — 2026-07-19 17:36 CEST — Repo Efficiency Pass 6 of 6: use outcome as target-state authority.
// Concurrent edit — 2026-07-20 16:27 CEST — Workspace Spine pass: compose Supplier membership outcome before selection validation and bind real target ids.
// Concurrent edit — 2026-07-21 22:31 CEST — Workspace family alignment: consume Supplier core-owned target authority.
import { computed } from 'vue'
import { useSupplierWorkspace } from '../core/useSupplierWorkspace'

export function useSupplierWorkspaceIndex() {
  const {
    suppliers,
    selection: workspaceSelection,
    runtime: workspaceRuntime,
    actions: workspaceActions,
  } = useSupplierWorkspace()
  const debug = computed(() => ({
    supplierId: workspaceSelection.supplierId.value,
    activeSupplierAppId: workspaceRuntime.appId.value,
    rootCollection: workspaceRuntime.rootCollection.value,
    readOnly: workspaceRuntime.readOnly.value,
    canWrite: workspaceRuntime.canWrite.value,
    selectedSupplier: workspaceSelection.supplier.value,
    targetCount: suppliers.count.value,
  }))

  return {
    supplier: workspaceSelection.supplier,
    supplierId: workspaceSelection.supplierId,
    suppliers: suppliers.targets,
    outcome: suppliers.outcome,
    selectSupplier: workspaceActions.selectSupplier,
    clearSupplier: workspaceActions.clearSelectedSupplier,
    debug,
  }
}
