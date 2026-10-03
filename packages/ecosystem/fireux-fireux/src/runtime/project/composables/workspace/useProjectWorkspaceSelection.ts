import { useWorkspace } from 'fireux-core/runtime/composables/fireux/workspace/useWorkspace'
import { normalizeString } from 'fireux-core/runtime/utils/string'

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
