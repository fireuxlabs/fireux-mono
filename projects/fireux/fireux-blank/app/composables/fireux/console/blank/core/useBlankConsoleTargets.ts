import type { ConsoleMode } from 'fireux-core/runtime/composables/fireux/app/console/useConsole'
import { useConsoleSelection } from 'fireux-core/runtime/composables/fireux/app/console/useConsoleSelection'

type BlankConsoleTargetInput = {
  selectedId?: string
  blankId?: string
  mode?: ConsoleMode
}

export function useBlankConsoleTargets() {
  const selection = useConsoleSelection({ family: 'blank' })

  const setBlankConsoleTarget = (
    selectionPatch: BlankConsoleTargetInput = {}
  ) => {
    selection.setSelection({
      selectedId: selectionPatch.selectedId,
      id: selectionPatch.blankId,
      mode: selectionPatch.mode,
    })
  }

  return {
    selectedId: selection.selectedId,
    mode: selection.mode,
    setBlankConsoleTarget,
    clearBlankConsoleTarget: selection.clearSelection,
  }
}
