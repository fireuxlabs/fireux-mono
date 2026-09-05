import { useWorkspace } from '../../../../composables/fireux/workspace/useWorkspace'
import { normalizeString } from '../../../../utils/string'

type ProjectWorkspaceSelectionInput = {
  selectedId?: string
  projectId?: string
}

export function useProjectWorkspaceSelection() {
  const { selectedId, select, clear } = useWorkspace('project')

  const setProjectWorkspaceSelection = (
    selectionPatch: ProjectWorkspaceSelectionInput = {}
  ) => {
    const hasNextId =
      selectionPatch.selectedId !== undefined ||
      selectionPatch.projectId !== undefined
    const nextId = hasNextId
      ? normalizeString(selectionPatch.selectedId ?? selectionPatch.projectId)
      : selectedId.value

    select(nextId)
  }

  return {
    selectedId,
    setProjectWorkspaceSelection,
    clearProjectWorkspaceSelection: clear,
  }
}
