import { computed } from 'vue'
import { normalizeConsoleString as normalizeString } from 'fireux-core/runtime/composables/fireux/console/useConsole'
import { useConsoleOverview } from 'fireux-core/runtime/composables/fireux/console/useConsoleOverview'
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
    rootCollection,
    canWrite,
    clearSelectedSupplier,
  } =
    useSupplierConsole()

  const overview = useConsoleOverview<SupplierSurface, SupplierSurface>({
    selectedEntity: selectedSupplier,
    selectedMode,
    liveItems: liveSuppliers,
    demoItems: demoSuppliers,
    testItem: testSupplier,
    getId: (supplier) => normalizeString(supplier?.id),
  })
  const debug = computed(() => ({
    mode: selectedMode.value,
    supplierId: supplierId.value,
    rootCollection: rootCollection.value,
    canWrite: canWrite.value,
    focus: overview.focus.value,
    group: {
      count: overview.group.value.count,
      ids: overview.group.value.items.map((item) => normalizeString(item?.id)),
    },
  }))

  return {
    ...overview,
    selectedSupplier,
    selectedMode,
    supplierId,
    rootCollection,
    canWrite,
    clearSelectedSupplier,
    debug,
  }
}
