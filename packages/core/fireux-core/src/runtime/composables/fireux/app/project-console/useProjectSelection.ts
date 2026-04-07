import { computed } from 'vue'
import { normalizeString } from '../../console/console.normalize'
import type { ConsoleMode } from '../../console/console.types'
import {
  selectionKey,
  useConsoleSelection,
} from '../../console/useConsoleSelection'
import { toConsoleSelectionStateKey } from '../routing/consoleRoutes'

type ProjectSelectionState = {
  selectedId: string
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
  }
}

export function useProjectSelection() {
  const selection = useConsoleSelection<ProjectSelectionState>({
    cookieKey: COOKIE_KEY,
    defaultState: () => ({ selectedId: '' }),
    normalizeState: normalizeSelectionState,
  })

  const selectedId = selectionKey(selection, 'selectedId')
  const mode = computed<ConsoleMode>(() => 'live')

  const setRuntimeProject = (selectionPatch: RuntimeProjectSelectionInput = {}) => {
    const nextId =
      selectionPatch.selectedId !== undefined || selectionPatch.projectId !== undefined
        ? normalizeString(selectionPatch.selectedId ?? selectionPatch.projectId)
        : selectedId.value

    selection.set({ selectedId: nextId })
  }

  const clearRuntimeProject = () => {
    selection.clear()
  }

  return {
    selectedId,
    mode,
    runtimeProjectId: selectedId,
    runtimeProjectMode: mode,
    setRuntimeProject,
    clearRuntimeProject,
  }
}
