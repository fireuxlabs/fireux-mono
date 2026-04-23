import { useConsoleOverview } from 'fireux-core/runtime/composables/fireux/console/useConsoleOverview'
import { type SupplierSurface } from '../../firestore/supplier/utils/view/useSupplierInterface'
import { useSupplierConsole } from './useSupplierConsole'

const normalizeString = (value: unknown) => String(value ?? '').trim()

export function useSupplierConsoleOverview() {
  const { liveSuppliers, demoSuppliers, testSupplier, selectedSupplier, selectedMode } =
    useSupplierConsole()

  return useConsoleOverview<SupplierSurface, SupplierSurface>({
    selectedEntity: selectedSupplier,
    selectedMode,
    liveItems: liveSuppliers,
    demoItems: demoSuppliers,
    testItem: testSupplier,
    getId: (supplier) => normalizeString(supplier?.id),
  })
}
