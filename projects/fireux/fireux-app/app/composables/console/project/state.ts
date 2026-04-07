import { normalizeRuntimeMode, normalizeString } from 'fireux-core/runtime/composables/fireux/runtime/runtime.normalize'
import { toConsoleSelectionStateKey } from 'fireux-core/runtime/composables/fireux/app/routing/consoleRoutes'
import type { RuntimeMode } from 'fireux-core/runtime/composables/fireux/runtime/runtime.types'
import { createRuntimeEntitySelection } from 'fireux-core/runtime/composables/fireux/runtime/useRuntimeSelection'

export type RuntimeProjectSelectionState = {
  selectedId: string
  mode: RuntimeMode
}

type RuntimeProjectSelectionInput = Partial<RuntimeProjectSelectionState> & {
  projectId?: string
}

const COOKIE_KEY = toConsoleSelectionStateKey('projects')
const useProjectSelectionBase = createRuntimeEntitySelection<RuntimeMode, 'projectId'>({
  cookieKey: COOKIE_KEY,
  aliasKey: 'projectId',
  defaultMode: 'demo',
  normalizeMode: (value) => normalizeRuntimeMode(value) ?? 'demo',
  normalizeId: normalizeString,
})

export function useRuntimeProjectSelection() {
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
