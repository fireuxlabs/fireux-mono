import { computed } from 'vue'
import { normalizeString } from 'fireux-core/runtime/utils/string'
import { useConsoleOverview } from 'fireux-core/runtime/composables/fireux/app/console/useConsoleOverview'
import { type SupplierSurface } from '../../../firestore/supplier/utils/view/useSupplierInterface'
import { useSupplierConsole } from '../core/useSupplierConsole'

export function useSupplierConsoleOverview() {
  const {
    suppliers,
    selection,
    runtime,
    actions,
  } =
    useSupplierConsole()

  const overview = useConsoleOverview<SupplierSurface>({
    selectedEntity: selection.supplier,
    targetItems: suppliers.targets,
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
      ids: overview.multiple.value.items.map((item) => normalizeString(item?.id)),
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
