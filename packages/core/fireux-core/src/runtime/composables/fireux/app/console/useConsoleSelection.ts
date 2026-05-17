import {
  normalizeConsoleString,
  useConsole,
  type ConsoleMode,
} from './useConsole'

type UseConsoleSelectionOptions = {
  family: string
}

type ConsoleSelectionPatch = {
  selectedId?: string
  id?: string
  mode?: ConsoleMode
}

export function useConsoleSelection(options: UseConsoleSelectionOptions) {
  const { selectedId, selectedMode, selectEntity, clearSelection } =
    useConsole(options.family)

  const setSelection = (patch: ConsoleSelectionPatch = {}) => {
    const nextId =
      patch.selectedId !== undefined || patch.id !== undefined
        ? normalizeConsoleString(patch.selectedId ?? patch.id)
        : selectedId.value

    const nextMode = patch.mode ?? selectedMode.value
    selectEntity(nextId, nextMode)
  }

  return {
    selectedId,
    mode: selectedMode,
    setSelection,
    clearSelection,
  }
}
