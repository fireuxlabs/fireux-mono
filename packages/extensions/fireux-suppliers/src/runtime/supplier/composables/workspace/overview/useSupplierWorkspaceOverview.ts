// Concurrent edit — 2026-07-20 16:26 CEST — Workspace Spine pass: carry Supplier target outcome into overview.
import { computed } from 'vue'
import { normalizeString } from 'fireux-core/runtime/utils/string'
import { useWorkspaceOverview } from 'fireux-core/runtime/composables/fireux/workspace/useWorkspaceOverview'
import { type SupplierSurface } from '../../firestore/utils/view/useSupplierInterface'
import { useSupplierWorkspace } from '../core/useSupplierWorkspace'

export function useSupplierWorkspaceOverview() {
  const { suppliers, selection, runtime, actions } = useSupplierWorkspace()

  const overview = useWorkspaceOverview<SupplierSurface>({
    selectedEntity: selection.supplier,
    targetItems: suppliers.targets,
    targetOutcome: suppliers.outcome,
    getId: (supplier) => normalizeString(supplier?.id),
  })
  const debug = computed(() => ({
    supplierId: selection.supplierId.value,
    activeSupplierAppId: runtime.appId.value,
    rootCollection: runtime.rootCollection.value,
    readOnly: runtime.readOnly.value,
    canWrite: runtime.canWrite.value,
    focus: overview.focus.value,
    multiple: {
      count: overview.multiple.value.count,
      ids: overview.multiple.value.items.map((item) =>
        normalizeString(item?.id)
      ),
    },
  }))

  return {
    ...overview,
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
