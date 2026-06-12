import { useConsoleSelection } from 'fireux-core/runtime/composables/fireux/app/console/useConsoleSelection'

type KitchenConsoleSelectionInput = {
  selectedId?: string
  kitchenId?: string
}

export function useKitchenConsoleSelection() {
  const selection = useConsoleSelection({ family: 'kitchen' })

  const setKitchenConsoleSelection = (selectionPatch: KitchenConsoleSelectionInput = {}) => {
    selection.setSelection({
      selectedId: selectionPatch.selectedId,
      id: selectionPatch.kitchenId,
    })
  }

  return {
    selectedId: selection.selectedId,
    setKitchenConsoleSelection,
    clearKitchenConsoleSelection: selection.clearSelection,
  }
}
