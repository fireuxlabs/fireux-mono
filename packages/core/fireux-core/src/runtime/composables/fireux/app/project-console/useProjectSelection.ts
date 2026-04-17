import { computed } from 'vue'
import { useState } from '#imports'
import {
  normalizeConsoleMode,
  normalizeString,
} from '../../console/console.normalize'
import type { ConsoleMode } from '../../console/console.types'

type ProjectSelectionState = {
  selectedId: string
  mode: ConsoleMode
}

type RuntimeProjectSelectionInput = {
  selectedId?: string
  projectId?: string
  mode?: ConsoleMode
}

const PROJECT_SELECTION_KEY = 'fireux-project-selection'

export function useProjectSelection() {
  const state = useState<ProjectSelectionState>(PROJECT_SELECTION_KEY, () => ({
    selectedId: '',
    mode: 'live',
  }))

  const selectedId = computed(() => state.value.selectedId)
  const mode = computed(() => state.value.mode)

  const setRuntimeProject = (selectionPatch: RuntimeProjectSelectionInput = {}) => {
    const nextId =
      selectionPatch.selectedId !== undefined || selectionPatch.projectId !== undefined
        ? normalizeString(selectionPatch.selectedId ?? selectionPatch.projectId)
        : selectedId.value

    const nextMode =
      selectionPatch.mode !== undefined
        ? normalizeConsoleMode(selectionPatch.mode, { defaultMode: mode.value })
        : mode.value

    state.value = {
      selectedId: nextId,
      mode: nextMode,
    }
  }

  const clearRuntimeProject = () => {
    state.value = {
      selectedId: '',
      mode: 'live',
    }
  }

  return {
    selectedId,
    mode,
    setRuntimeProject,
    clearRuntimeProject,
  }
}
