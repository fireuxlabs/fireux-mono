import { useConsoleSelection } from 'fireux-core/runtime/composables/fireux/app/console/useConsoleSelection'
import { normalizeString } from 'fireux-core/runtime/utils/string'

type SupplierConsoleSelectionInput = {
  selectedId?: string
  supplierId?: string
}

export function useSupplierConsoleSelection() {
  const { selectedId, selectTarget, clearSelection } =
    useConsoleSelection('supplier')

  const setSupplierConsoleSelection = (selectionPatch: SupplierConsoleSelectionInput = {}) => {
    const hasNextId =
      selectionPatch.selectedId !== undefined ||
      selectionPatch.supplierId !== undefined
    const nextId = hasNextId
      ? normalizeString(selectionPatch.selectedId ?? selectionPatch.supplierId)
      : selectedId.value

    selectTarget(nextId, 'live')
  }

  return {
    selectedId,
    setSupplierConsoleSelection,
    clearSupplierConsoleSelection: clearSelection,
  }
}
