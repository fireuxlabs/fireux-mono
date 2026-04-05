import { computed } from 'vue'
import { normalizeRuntimeMode, normalizeString } from 'fireux-core/runtime/composables/fireux/runtime/runtime.normalize'
import { toConsoleSelectionStateKey } from 'fireux-core/runtime/composables/fireux/app/routing/consoleRoutes'
import type { RuntimeMode } from 'fireux-core/runtime/composables/fireux/runtime/runtime.types'
import { selectionKey, useRuntimeSelection } from 'fireux-core/runtime/composables/fireux/runtime/useRuntimeSelection'

export type RuntimeProjectSelectionState = {
  selectedId: string
  mode: RuntimeMode
}

type RuntimeProjectSelectionInput = Partial<RuntimeProjectSelectionState> & {
  projectId?: string
}

const COOKIE_KEY = toConsoleSelectionStateKey('projects')

const normalizeSelectionState = (value: unknown): RuntimeProjectSelectionState => {
  const source = value && typeof value === 'object' ? (value as Record<string, unknown>) : {}
  return {
    selectedId: normalizeString(source.selectedId ?? source.projectId),
    mode: normalizeRuntimeMode(source.mode) ?? 'demo',
  }
}

export function useRuntimeProjectSelection() {
  const selection = useRuntimeSelection<RuntimeProjectSelectionState>({
    cookieKey: COOKIE_KEY,
    defaultState: () => ({ selectedId: '', mode: 'demo' }),
    normalizeState: normalizeSelectionState,
  })

  const setRuntimeProject = (selectionPatch: RuntimeProjectSelectionInput = {}) => {
    const next: RuntimeProjectSelectionState = {
      selectedId:
        selectionPatch.selectedId !== undefined || selectionPatch.projectId !== undefined
          ? normalizeString(selectionPatch.selectedId ?? selectionPatch.projectId)
          : selection.state.value.selectedId,
      mode:
        selectionPatch.mode !== undefined
          ? normalizeRuntimeMode(selectionPatch.mode) ?? selection.state.value.mode
          : selection.state.value.mode,
    }

    selection.set(next)
  }

  const clearRuntimeProject = () => {
    selection.clear()
  }

  const selectedId = selectionKey(selection, 'selectedId')
  const mode = computed(() => normalizeRuntimeMode(selection.state.value.mode) ?? 'demo')

  return {
    selectedId,
    mode,
    runtimeProjectId: selectedId,
    runtimeProjectMode: mode,
    setRuntimeProject,
    clearRuntimeProject,
  }
}
