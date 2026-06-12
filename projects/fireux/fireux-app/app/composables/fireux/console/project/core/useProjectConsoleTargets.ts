import { useConsoleSelection } from 'fireux-core/runtime/composables/fireux/app/console/useConsoleSelection'

type ProjectConsoleTargetInput = {
  selectedId?: string
  projectId?: string
}

export function useProjectConsoleTargets() {
  const selection = useConsoleSelection({ family: 'project' })

  const setProjectConsoleTarget = (selectionPatch: ProjectConsoleTargetInput = {}) => {
    selection.setSelection({
      selectedId: selectionPatch.selectedId,
      id: selectionPatch.projectId,
    })
  }

  return {
    selectedId: selection.selectedId,
    setProjectConsoleTarget,
    clearProjectConsoleTarget: selection.clearSelection,
  }
}
