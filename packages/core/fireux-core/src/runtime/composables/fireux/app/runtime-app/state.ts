import { useCookie, useState } from '#imports'
import { computed } from 'vue'
import { normalizeRuntimeMode, normalizeString } from '../runtime/runtime.normalize'
import type { RuntimeMode } from '../runtime/runtime.types'

export type RuntimeAppSelectionState = {
  appId: string
  mode: RuntimeMode
}

// keep the cookie key short to avoid exceeding domain limits when ecs are nested
const COOKIE_KEY = 'fireux_runtime_app'

const normalizeSelectionState = (value: unknown): RuntimeAppSelectionState => {
  const source = value && typeof value === 'object' ? (value as Record<string, unknown>) : {}
  return {
    appId: normalizeString(source.appId),
    mode: normalizeRuntimeMode(source.mode) ?? 'live',
  }
}

export function useRuntimeAppSelection() {
  const cookie = useCookie<RuntimeAppSelectionState>(COOKIE_KEY, {
    default: () => ({ appId: '', mode: 'live' }),
    sameSite: 'lax',
  })

  const runtimeAppState = useState<RuntimeAppSelectionState>(COOKIE_KEY, () =>
    normalizeSelectionState(cookie.value)
  )

  // keep cookie synced
  cookie.value = normalizeSelectionState(runtimeAppState.value)

  const setRuntimeApp = (selection: Partial<RuntimeAppSelectionState> = {}) => {
    const next: RuntimeAppSelectionState = {
      appId:
        selection.appId !== undefined
          ? normalizeString(selection.appId)
          : runtimeAppState.value.appId,
      mode:
        selection.mode !== undefined
          ? normalizeRuntimeMode(selection.mode) ?? runtimeAppState.value.mode
          : runtimeAppState.value.mode,
    }

    runtimeAppState.value = next
    cookie.value = next
  }

  const clearRuntimeApp = () => {
    const next: RuntimeAppSelectionState = { appId: '', mode: 'live' }
    runtimeAppState.value = next
    cookie.value = next
  }

  return {
    runtimeAppId: computed(() => runtimeAppState.value.appId),
    runtimeAppMode: computed(() => normalizeRuntimeMode(runtimeAppState.value.mode) ?? 'live'),
    setRuntimeApp,
    clearRuntimeApp,
  }
}
