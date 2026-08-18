import { useConsoleSelection } from '../../../../composables/fireux/console/useConsoleSelection'
import type { ConsoleSource } from '../../../../composables/fireux/console/useConsole'
import { normalizeString } from '../../../../utils/string'

type ProjectConsoleSelectionInput = {
  selectedId?: string
  projectId?: string
  type?: ConsoleSource
}

export function useProjectConsoleSelection() {
  const { selectedId, selectTarget, clearSelection } =
    useConsoleSelection('project')

  const setProjectConsoleSelection = (selectionPatch: ProjectConsoleSelectionInput = {}) => {
    const hasNextId =
      selectionPatch.selectedId !== undefined ||
      selectionPatch.projectId !== undefined
    const nextId = hasNextId
      ? normalizeString(selectionPatch.selectedId ?? selectionPatch.projectId)
      : selectedId.value

    selectTarget(nextId, selectionPatch.type ?? 'live')
  }

  return {
    selectedId,
    setProjectConsoleSelection,
    clearProjectConsoleSelection: clearSelection,
  }
}
