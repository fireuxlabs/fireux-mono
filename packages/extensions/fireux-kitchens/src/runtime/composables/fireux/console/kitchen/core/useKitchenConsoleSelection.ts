import {
  useConsoleSelection,
} from 'fireux-core/runtime/composables/fireux/app/console/useConsoleSelection'
import type {
  ConsoleSource,
} from 'fireux-core/runtime/composables/fireux/app/console/useConsole'
import { normalizeString } from 'fireux-core/runtime/utils/string'

type KitchenConsoleSelectionInput = {
  selectedId?: string
  kitchenId?: string
  type?: ConsoleSource
  /** Compatibility alias for callers written before Console data envelopes. */
  source?: ConsoleSource
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

    selectTarget(
      nextId,
      selectionPatch.type ?? selectionPatch.source ?? 'live'
    )
  }

  return {
    selectedId,
    setKitchenConsoleSelection,
    clearKitchenConsoleSelection: clearSelection,
  }
}
