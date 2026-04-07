import { normalizeConsoleMode, normalizeString } from 'fireux-core/runtime/composables/fireux/console/console.normalize'
import { toConsoleSelectionStateKey } from 'fireux-core/runtime/composables/fireux/app/routing/consoleRoutes'
import type { ConsoleMode } from 'fireux-core/runtime/composables/fireux/console/console.types'
import { createConsoleEntitySelection } from 'fireux-core/runtime/composables/fireux/console/useConsoleSelection'

export type RuntimeProjectSelectionState = {
  selectedId: string
  mode: ConsoleMode
}

type RuntimeProjectSelectionInput = Partial<RuntimeProjectSelectionState> & {
  projectId?: string
}

const COOKIE_KEY = toConsoleSelectionStateKey('projects')
const useProjectSelectionBase = createConsoleEntitySelection<ConsoleMode, 'projectId'>({
  cookieKey: COOKIE_KEY,
  aliasKey: 'projectId',
  defaultMode: 'live',
  normalizeMode: (value) => normalizeConsoleMode(value) ?? 'live',
  normalizeId: normalizeString,
})

export function useProjectSelection() {
  const selection = useProjectSelectionBase()
  const setRuntimeProject = (selectionPatch: RuntimeProjectSelectionInput = {}) =>
    selection.setSelection(selectionPatch)
  const clearRuntimeProject = () => selection.clearSelection()

  return {
    selectedId: selection.selectedId,
    mode: selection.mode,
    runtimeProjectId: selection.selectedId,
    runtimeProjectMode: selection.mode,
    setRuntimeProject,
    clearRuntimeProject,
  }
}
