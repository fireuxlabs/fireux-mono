import { useWorkspace } from '../../../../composables/fireux/workspace/useWorkspace'
import { normalizeString } from '../../../../utils/string'

type ProjectWorkspaceSelectionInput = {
  selectedId?: string
  projectId?: string
}

export function useProjectWorkspaceSelection() {
  const { currentId, setCurrent, clearCurrent } = useWorkspace('project')

  const setProjectWorkspaceSelection = (selectionPatch: ProjectWorkspaceSelectionInput = {}) => {
    const hasNextId =
      selectionPatch.selectedId !== undefined ||
      selectionPatch.projectId !== undefined
    const nextId = hasNextId
      ? normalizeString(selectionPatch.selectedId ?? selectionPatch.projectId)
      : currentId.value

    setCurrent(nextId)
  }

  return {
    selectedId: currentId,
    setProjectWorkspaceSelection,
    clearProjectWorkspaceSelection: clearCurrent,
  }
}
