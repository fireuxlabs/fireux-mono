import { computed } from 'vue'
import { normalizeConsoleString as normalizeString } from 'fireux-core/runtime/composables/fireux/app/console/useConsole'
import { useConsoleOverview } from 'fireux-core/runtime/composables/fireux/app/console/useConsoleOverview'
import { type SupplierSurface } from '../../firestore/supplier/utils/view/useSupplierInterface'
import { useSupplierConsole } from './useSupplierConsole'

export function useSupplierConsoleOverview() {
  const {
    liveSuppliers,
    demoSuppliers,
    testSupplier,
    selectedSupplier,
    selectedMode,
    supplierId,
    activeSupplierAppId,
    rootCollection,
    canWrite,
    clearSelectedSupplier,
  } =
    useSupplierConsole()

  const overview = useConsoleOverview<SupplierSurface>({
    selectedEntity: selectedSupplier,
    selectedMode,
    liveItems: liveSuppliers,
    demoItems: demoSuppliers,
    testItem: testSupplier,
    getId: (supplier) => normalizeString(supplier?.id),
  })
  const debug = computed(() => ({
    selectedMode: selectedMode.value,
    supplierId: supplierId.value,
    activeSupplierAppId: activeSupplierAppId.value,
    rootCollection: rootCollection.value,
    canWrite: canWrite.value,
    focus: overview.focus.value,
    multiple: {
      count: overview.multiple.value.count,
      ids: overview.multiple.value.items.map((item) => normalizeString(item?.id)),
    },
  }))

  return {
    ...overview,
    selectedSupplier,
    selectedMode,
    supplierId,
    activeSupplierAppId,
    rootCollection,
    canWrite,
    clearSelectedSupplier,
    debug,
  }
}
