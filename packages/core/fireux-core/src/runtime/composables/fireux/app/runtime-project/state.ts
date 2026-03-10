import { useCookie, useState } from '#imports'
import { computed } from 'vue'
import { normalizeRuntimeMode, normalizeString } from '../../runtime/runtime.normalize'
import type { RuntimeMode } from '../../runtime/runtime.types'

export type RuntimeProjectSelectionState = {
  projectId: string
  mode: RuntimeMode
}

const COOKIE_KEY = 'fireux_runtime_project'

const normalizeSelectionState = (value: unknown): RuntimeProjectSelectionState => {
  const source = value && typeof value === 'object' ? (value as Record<string, unknown>) : {}
  return {
    projectId: normalizeString(source.projectId),
    mode: normalizeRuntimeMode(source.mode) ?? 'live',
  }
}

export function useRuntimeProjectSelection() {
  const cookie = useCookie<RuntimeProjectSelectionState>(COOKIE_KEY, {
    default: () => ({ projectId: '', mode: 'live' }),
    path: '/',
    sameSite: 'lax',
  })

  const runtimeProjectState = useState<RuntimeProjectSelectionState>(COOKIE_KEY, () =>
    normalizeSelectionState(cookie.value)
  )

  cookie.value = normalizeSelectionState(runtimeProjectState.value)

  const setRuntimeProject = (selection: Partial<RuntimeProjectSelectionState> = {}) => {
    const next: RuntimeProjectSelectionState = {
      projectId:
        selection.projectId !== undefined
          ? normalizeString(selection.projectId)
          : runtimeProjectState.value.projectId,
      mode:
        selection.mode !== undefined
          ? normalizeRuntimeMode(selection.mode) ?? runtimeProjectState.value.mode
          : runtimeProjectState.value.mode,
    }

    runtimeProjectState.value = next
    cookie.value = next
  }

  const clearRuntimeProject = () => {
    const next: RuntimeProjectSelectionState = { projectId: '', mode: 'live' }
    runtimeProjectState.value = next
    cookie.value = next
  }

  return {
    runtimeProjectId: computed(() => runtimeProjectState.value.projectId),
    runtimeProjectMode: computed(() => normalizeRuntimeMode(runtimeProjectState.value.mode) ?? 'live'),
    setRuntimeProject,
    clearRuntimeProject,
  }
}
