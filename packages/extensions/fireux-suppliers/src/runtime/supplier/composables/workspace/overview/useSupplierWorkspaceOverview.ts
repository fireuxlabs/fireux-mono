// Concurrent edit — 2026-07-20 16:26 CEST — Workspace Spine pass: carry Supplier target outcome into overview.
import { computed } from 'vue'
import { normalizeString } from 'fireux-core/runtime/utils/string'
import { useSupplierWorkspace } from '../core/useSupplierWorkspace'

export function useSupplierWorkspaceOverview() {
  const { suppliers, selection, runtime, actions } = useSupplierWorkspace()

  const focus = computed(() => ({
    entity: selection.supplier.value,
    id: normalizeString(selection.supplier.value?.id),
    hasSelection: Boolean(selection.supplier.value),
    outcome: suppliers.outcome.value,
  }))
  const multiple = computed(() => ({
    items: suppliers.targets.value,
    count: suppliers.count.value,
    hasItems: suppliers.count.value > 0,
    outcome: suppliers.outcome.value,
  }))
  const debug = computed(() => ({
    supplierId: selection.supplierId.value,
    activeSupplierAppId: runtime.appId.value,
    rootCollection: runtime.rootCollection.value,
    readOnly: runtime.readOnly.value,
    canWrite: runtime.canWrite.value,
    focus: focus.value,
    multiple: {
      count: multiple.value.count,
      ids: multiple.value.items.map((item) =>
        normalizeString(item?.id)
      ),
    },
  }))

  return {
    focus,
    multiple,
    outcome: suppliers.outcome,
    selectedSupplier: selection.supplier,
    supplierId: selection.supplierId,
    activeSupplierAppId: runtime.appId,
    rootCollection: runtime.rootCollection,
    readOnly: runtime.readOnly,
    canWrite: runtime.canWrite,
    clearSelectedSupplier: actions.clearSelectedSupplier,
    debug,
  }
}
