import { useConsoleSelection } from 'fireux-core/runtime/composables/fireux/app/console/useConsoleSelection'

type PropertyConsoleSelectionInput = {
  selectedId?: string
  propertyId?: string
}

export function usePropertyConsoleSelection() {
  const selection = useConsoleSelection({ family: 'property' })

  const setPropertyConsoleSelection = (selectionPatch: PropertyConsoleSelectionInput = {}) => {
    selection.setSelection({
      selectedId: selectionPatch.selectedId,
      id: selectionPatch.propertyId,
    })
  }

  return {
    selectedId: selection.selectedId,
    setPropertyConsoleSelection,
    clearPropertyConsoleSelection: selection.clearSelection,
  }
}
