import { useWorkspace } from '../../../../composables/fireux/workspace/useWorkspace'
import { normalizeString } from '../../../../utils/string'

type ProjectWorkspaceSelectionInput = {
  selectedId?: string
  projectId?: string
}

export function useProjectWorkspaceSelection() {
  const { activeId, activate, clearActive } = useWorkspace('project')

  const setProjectWorkspaceSelection = (
    selectionPatch: ProjectWorkspaceSelectionInput = {}
  ) => {
    const hasNextId =
      selectionPatch.selectedId !== undefined ||
      selectionPatch.projectId !== undefined
    const nextId = hasNextId
      ? normalizeString(selectionPatch.selectedId ?? selectionPatch.projectId)
      : activeId.value

    activate(nextId)
  }

  return {
    selectedId: activeId,
    setProjectWorkspaceSelection,
    clearProjectWorkspaceSelection: clearActive,
  }
}
