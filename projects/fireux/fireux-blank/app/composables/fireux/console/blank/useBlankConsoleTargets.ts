import type { ConsoleMode } from 'fireux-core/runtime/composables/fireux/app/console/useConsole'
import { useConsoleSelection } from 'fireux-core/runtime/composables/fireux/app/console/useConsoleSelection'

type BlankConsoleTargetInput = {
  selectedId?: string
  blankId?: string
  mode?: ConsoleMode
}

export function useBlankConsoleTargets() {
  const targets = useConsoleSelection({ family: 'blank' })

  const setBlankConsoleTarget = (targetPatch: BlankConsoleTargetInput = {}) => {
    targets.setSelection({
      selectedId: targetPatch.selectedId,
      id: targetPatch.blankId,
      mode: targetPatch.mode,
    })
  }

  return {
    selectedId: targets.selectedId,
    mode: targets.mode,
    setBlankConsoleTarget,
    clearBlankConsoleTarget: targets.clearSelection,
  }
}
