import type { ConsoleMode } from 'fireux-core/runtime/composables/fireux/app/console/useConsole'
import { useConsoleSelection } from 'fireux-core/runtime/composables/fireux/app/console/useConsoleSelection'

type KitchenSelectionInput = {
  selectedId?: string
  kitchenId?: string
  mode?: ConsoleMode
}

export function useKitchenSelection() {
  const selection = useConsoleSelection({ family: 'kitchen' })

  const setKitchenSelection = (selectionPatch: KitchenSelectionInput = {}) => {
    selection.setSelection({
      selectedId: selectionPatch.selectedId,
      id: selectionPatch.kitchenId,
      mode: selectionPatch.mode,
    })
  }

  return {
    selectedId: selection.selectedId,
    mode: selection.mode,
    setKitchenSelection,
    clearKitchenSelection: selection.clearSelection,
  }
}
