import { useConsoleSelection } from 'fireux-core/runtime/composables/fireux/app/console/useConsoleSelection'

type SupplierConsoleTargetInput = {
  selectedId?: string
  supplierId?: string
}

export function useSupplierConsoleTargets() {
  const selection = useConsoleSelection({ family: 'supplier' })

  const setSupplierConsoleTarget = (selectionPatch: SupplierConsoleTargetInput = {}) => {
    selection.setSelection({
      selectedId: selectionPatch.selectedId,
      id: selectionPatch.supplierId,
    })
  }

  return {
    selectedId: selection.selectedId,
    setSupplierConsoleTarget,
    clearSupplierConsoleTarget: selection.clearSelection,
  }
}
