import type { ConsoleMode } from 'fireux-core/runtime/composables/fireux/app/console/useConsole'
import { useConsoleSelection } from 'fireux-core/runtime/composables/fireux/app/console/useConsoleSelection'

type KitchenConsoleTargetInput = {
  selectedId?: string
  kitchenId?: string
  mode?: ConsoleMode
}

export function useKitchenConsoleTargets() {
  const selection = useConsoleSelection({ family: 'kitchen' })

  const setKitchenConsoleTarget = (selectionPatch: KitchenConsoleTargetInput = {}) => {
    selection.setSelection({
      selectedId: selectionPatch.selectedId,
      id: selectionPatch.kitchenId,
      mode: selectionPatch.mode,
    })
  }

  return {
    selectedId: selection.selectedId,
    mode: selection.mode,
    setKitchenConsoleTarget,
    clearKitchenConsoleTarget: selection.clearSelection,
  }
}
