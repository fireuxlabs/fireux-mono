import { useWorkspaceSelection } from '../../../../composables/fireux/workspace/useWorkspaceSelection'
import type { WorkspaceSource } from '../../../../composables/fireux/workspace/useWorkspace'
import { normalizeString } from '../../../../utils/string'

type ProjectWorkspaceSelectionInput = {
  selectedId?: string
  projectId?: string
  type?: WorkspaceSource
}

export function useProjectWorkspaceSelection() {
  const { selectedId, selectTarget, clearSelection } =
    useWorkspaceSelection('project')

  const setProjectWorkspaceSelection = (selectionPatch: ProjectWorkspaceSelectionInput = {}) => {
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
    setProjectWorkspaceSelection,
    clearProjectWorkspaceSelection: clearSelection,
  }
}
