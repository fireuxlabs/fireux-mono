import {
  useConsole,
  type ConsoleMode,
} from 'fireux-core/runtime/composables/fireux/app/console/useConsole'

type RuntimeProjectSelectionInput = {
  selectedId?: string
  projectId?: string
  mode?: ConsoleMode
}

const normalizeString = (value: unknown) => String(value ?? '').trim()

export function useProjectSelection() {
  const { selectedId, selectedMode, selectEntity, clearSelection } = useConsole('project')

  const setRuntimeProject = (selectionPatch: RuntimeProjectSelectionInput = {}) => {
    const nextId =
      selectionPatch.selectedId !== undefined || selectionPatch.projectId !== undefined
        ? normalizeString(selectionPatch.selectedId ?? selectionPatch.projectId)
        : selectedId.value

    const nextMode = selectionPatch.mode ?? selectedMode.value

    selectEntity(nextId, nextMode)
  }

  const clearRuntimeProject = () => {
    clearSelection()
  }

  return {
    selectedId,
    mode: selectedMode,
    setRuntimeProject,
    clearRuntimeProject,
  }
}
