import { useConsoleSelection } from 'fireux-core/runtime/composables/fireux/app/console/useConsoleSelection'

type ProjectConsoleSelectionInput = {
  selectedId?: string
  projectId?: string
}

export function useProjectConsoleSelection() {
  const selection = useConsoleSelection({ family: 'project' })

  const setProjectConsoleSelection = (selectionPatch: ProjectConsoleSelectionInput = {}) => {
    selection.setSelection({
      selectedId: selectionPatch.selectedId,
      id: selectionPatch.projectId,
    })
  }

  return {
    selectedId: selection.selectedId,
    setProjectConsoleSelection,
    clearProjectConsoleSelection: selection.clearSelection,
  }
}
