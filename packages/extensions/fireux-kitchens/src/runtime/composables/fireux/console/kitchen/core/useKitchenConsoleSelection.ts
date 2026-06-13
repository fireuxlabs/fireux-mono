import { useConsoleSelection } from 'fireux-core/runtime/composables/fireux/app/console/useConsoleSelection'
import { normalizeString } from 'fireux-core/runtime/utils/string'

type KitchenConsoleSelectionInput = {
  selectedId?: string
  kitchenId?: string
}

export function useKitchenConsoleSelection() {
  const { selectedId, selectTarget, clearSelection } =
    useConsoleSelection('kitchen')

  const setKitchenConsoleSelection = (selectionPatch: KitchenConsoleSelectionInput = {}) => {
    const hasNextId =
      selectionPatch.selectedId !== undefined ||
      selectionPatch.kitchenId !== undefined
    const nextId = hasNextId
      ? normalizeString(selectionPatch.selectedId ?? selectionPatch.kitchenId)
      : selectedId.value

    selectTarget(nextId)
  }

  return {
    selectedId,
    setKitchenConsoleSelection,
    clearKitchenConsoleSelection: clearSelection,
  }
}
