import type { ConsoleMode } from 'fireux-core/runtime/composables/fireux/app/console/useConsole'
import { useConsoleSelection } from 'fireux-core/runtime/composables/fireux/app/console/useConsoleSelection'

type ProjectConsoleTargetInput = {
  selectedId?: string
  projectId?: string
  mode?: ConsoleMode
}

export function useProjectConsoleTargets() {
  const selection = useConsoleSelection({ family: 'project' })

  const setProjectConsoleTarget = (selectionPatch: ProjectConsoleTargetInput = {}) => {
    selection.setSelection({
      selectedId: selectionPatch.selectedId,
      id: selectionPatch.projectId,
      mode: selectionPatch.mode,
    })
  }

  return {
    selectedId: selection.selectedId,
    mode: selection.mode,
    setProjectConsoleTarget,
    clearProjectConsoleTarget: selection.clearSelection,
  }
}
