import type { ConsoleMode } from 'fireux-core/runtime/composables/fireux/app/console/useConsole'
import { useConsoleSelection } from 'fireux-core/runtime/composables/fireux/app/console/useConsoleSelection'

type PropertyConsoleTargetInput = {
  selectedId?: string
  propertyId?: string
  mode?: ConsoleMode
}

export function usePropertyConsoleTargets() {
  const selection = useConsoleSelection({ family: 'property' })

  const setPropertyConsoleTarget = (selectionPatch: PropertyConsoleTargetInput = {}) => {
    selection.setSelection({
      selectedId: selectionPatch.selectedId,
      id: selectionPatch.propertyId,
      mode: selectionPatch.mode,
    })
  }

  return {
    selectedId: selection.selectedId,
    mode: selection.mode,
    setPropertyConsoleTarget,
    clearPropertyConsoleTarget: selection.clearSelection,
  }
}
