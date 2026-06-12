import { normalizeConsoleString, useConsole } from './useConsole'

type UseConsoleSelectionOptions = {
  family: string
}

type ConsoleSelectionPatch = {
  selectedId?: string
  id?: string
}

export function useConsoleSelection(options: UseConsoleSelectionOptions) {
  const { selectedId, selectEntity, clearSelection } = useConsole(options.family)

  const setSelection = (patch: ConsoleSelectionPatch = {}) => {
    const nextId =
      patch.selectedId !== undefined || patch.id !== undefined
        ? normalizeConsoleString(patch.selectedId ?? patch.id)
        : selectedId.value

    selectEntity(nextId)
  }

  return {
    selectedId,
    setSelection,
    clearSelection,
  }
}
