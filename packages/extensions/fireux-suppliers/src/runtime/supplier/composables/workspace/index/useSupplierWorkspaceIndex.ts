// Concurrent edit — 2026-07-19 17:36 CEST — Repo Efficiency Pass 6 of 6: use outcome as target-state authority.
// Concurrent edit — 2026-07-20 16:27 CEST — Workspace Spine pass: compose Supplier membership outcome before selection validation and bind real target ids.
// Concurrent edit — 2026-07-21 22:31 CEST — Workspace family alignment: consume Supplier core-owned target authority.
import { computed } from 'vue'
import { useWorkspaceIndex } from 'fireux-core/runtime/composables/fireux/workspace/useWorkspaceIndex'
import { useSupplierWorkspace } from '../core/useSupplierWorkspace'

export function useSupplierWorkspaceIndex() {
  const {
    suppliers,
    targeting,
    selection: workspaceSelection,
    runtime: workspaceRuntime,
    actions: workspaceActions,
  } = useSupplierWorkspace()
  const selection = computed(() => ({
    supplier: workspaceSelection.supplier.value,
    supplierId: workspaceSelection.supplierId.value,
  }))
  const runtime = computed(() => ({
    appId: workspaceRuntime.appId.value,
    rootCollection: workspaceRuntime.rootCollection.value,
    readOnly: workspaceRuntime.readOnly.value,
    canWrite: workspaceRuntime.canWrite.value,
  }))
  const debug = computed(() => ({
    supplierId: workspaceSelection.supplierId.value,
    activeSupplierAppId: workspaceRuntime.appId.value,
    rootCollection: workspaceRuntime.rootCollection.value,
    readOnly: workspaceRuntime.readOnly.value,
    canWrite: workspaceRuntime.canWrite.value,
    selectedSupplier: workspaceSelection.supplier.value,
    targetCount: suppliers.count.value,
    source: targeting.debug.value,
  }))

  return useWorkspaceIndex({
    selection,
    selectedId: computed(() => workspaceSelection.supplierId.value),
    runtime,
    targets: suppliers.targets,
    outcome: suppliers.outcome,
    getTargetId: (target) => String(target?.id ?? '').trim(),
    selectTarget: (id: string) => {
      workspaceActions.selectSupplier(String(id ?? '').trim())
    },
    clearSelection: workspaceActions.clearSelectedSupplier,
    debug,
  })
}
