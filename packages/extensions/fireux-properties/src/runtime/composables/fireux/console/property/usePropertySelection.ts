import type { ConsoleMode } from 'fireux-core/runtime/composables/fireux/app/console/useConsole'
import { useConsoleSelection } from 'fireux-core/runtime/composables/fireux/app/console/useConsoleSelection'

type PropertySelectionInput = {
  selectedId?: string
  propertyId?: string
  mode?: ConsoleMode
}

export function usePropertySelection() {
  const selection = useConsoleSelection({ family: 'property' })

  const setPropertySelection = (selectionPatch: PropertySelectionInput = {}) => {
    selection.setSelection({
      selectedId: selectionPatch.selectedId,
      id: selectionPatch.propertyId,
      mode: selectionPatch.mode,
    })
  }

  return {
    selectedId: selection.selectedId,
    mode: selection.mode,
    setPropertySelection,
    clearPropertySelection: selection.clearSelection,
  }
}
