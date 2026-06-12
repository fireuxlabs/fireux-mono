import { useConsoleSelection } from 'fireux-core/runtime/composables/fireux/app/console/useConsoleSelection'

type SupplierConsoleSelectionInput = {
  selectedId?: string
  supplierId?: string
}

export function useSupplierConsoleSelection() {
  const selection = useConsoleSelection({ family: 'supplier' })

  const setSupplierConsoleSelection = (selectionPatch: SupplierConsoleSelectionInput = {}) => {
    selection.setSelection({
      selectedId: selectionPatch.selectedId,
      id: selectionPatch.supplierId,
    })
  }

  return {
    selectedId: selection.selectedId,
    setSupplierConsoleSelection,
    clearSupplierConsoleSelection: selection.clearSelection,
  }
}
