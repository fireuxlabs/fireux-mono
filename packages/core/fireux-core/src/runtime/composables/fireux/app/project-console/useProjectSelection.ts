import {
  normalizeConsoleMode,
  normalizeString,
} from 'fireux-core/runtime/composables/fireux/console/console.normalize'
import type { ConsoleMode } from 'fireux-core/runtime/composables/fireux/console/console.types'
import {
  selectionKey,
  useConsoleSelection,
} from 'fireux-core/runtime/composables/fireux/console/useConsoleSelection'
import { toConsoleSelectionStateKey } from 'fireux-core/runtime/composables/fireux/app/routing/consoleRoutes'

type ProjectSelectionState = {
  selectedId: string
  mode: ConsoleMode
}

type RuntimeProjectSelectionInput = {
  selectedId?: string
  projectId?: string
  mode?: ConsoleMode
}

const COOKIE_KEY = toConsoleSelectionStateKey('projects')

const normalizeSelectionState = (value: unknown): ProjectSelectionState => {
  const source = value && typeof value === 'object' ? (value as Record<string, unknown>) : {}

  return {
    selectedId: normalizeString(source.selectedId ?? source.projectId),
    mode: normalizeConsoleMode(source.mode, { defaultMode: 'live' }),
  }
}

export function useProjectSelection() {
  const selection = useConsoleSelection<ProjectSelectionState>({
    cookieKey: COOKIE_KEY,
    defaultState: () => ({ selectedId: '', mode: 'live' }),
    normalizeState: normalizeSelectionState,
  })

  const selectedId = selectionKey(selection, 'selectedId')
  const mode = selectionKey(selection, 'mode')

  const setRuntimeProject = (selectionPatch: RuntimeProjectSelectionInput = {}) => {
    const nextId =
      selectionPatch.selectedId !== undefined || selectionPatch.projectId !== undefined
        ? normalizeString(selectionPatch.selectedId ?? selectionPatch.projectId)
        : selectedId.value
    const nextMode =
      selectionPatch.mode !== undefined
        ? normalizeConsoleMode(selectionPatch.mode, { defaultMode: mode.value })
        : mode.value

    selection.set({ selectedId: nextId, mode: nextMode })
  }

  const clearRuntimeProject = () => {
    selection.clear()
  }

  return {
    selectedId,
    mode,
    setRuntimeProject,
    clearRuntimeProject,
  }
}
