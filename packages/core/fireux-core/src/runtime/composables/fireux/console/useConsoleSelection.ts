import { useCookie, useState } from '#imports'
import type { Ref } from 'vue'
import { computed } from 'vue'
import { normalizeConsoleMode, normalizeString } from './console.normalize'
import type { ConsoleSelectionApi, ConsoleSelectionState } from './console.types'

type UseConsoleSelectionParams<TState extends Record<string, any>> = {
  cookieKey: string
  defaultState: () => TState
  normalizeState: (value: unknown) => TState
}

/**
 * Shared cookie + state selection store.
 * Current canon prefers small explicit entity wrappers on top of this.
 */
export function useConsoleSelection<TState extends Record<string, any>>(
  params: UseConsoleSelectionParams<TState>
): ConsoleSelectionApi<TState> & { state: Ref<TState> } {
  const cookie = useCookie<TState>(params.cookieKey, {
    default: params.defaultState,
    path: '/',
    sameSite: 'lax',
  })

  const state = useState<TState>(
    params.cookieKey,
    () => params.normalizeState(cookie.value)
  )

  const normalize = (value: unknown) => params.normalizeState(value)
  const sameState = (left: unknown, right: unknown) =>
    JSON.stringify(normalize(left)) === JSON.stringify(normalize(right))

  if (import.meta.client && !sameState(state.value, cookie.value)) {
    state.value = normalize(cookie.value)
  }

  if (!sameState(cookie.value, state.value)) {
    cookie.value = normalize(state.value)
  }

  const set = (patch: Partial<TState> = {}) => {
    const next = normalize({ ...(state.value as any), ...(patch as any) })
    state.value = next
    cookie.value = next
  }

  const clear = () => {
    const next = normalize(params.defaultState())
    state.value = next
    cookie.value = next
  }

  return {
    state,
    set,
    clear,
  }
}

const normalizeConsoleSelectionState = (value: unknown): ConsoleSelectionState => {
  const source = value && typeof value === 'object' ? (value as Record<string, unknown>) : {}

  return {
    selectedId: normalizeString(source.selectedId),
    mode: normalizeConsoleMode(source.mode, { defaultMode: 'live' }),
  }
}

export function useSharedConsoleSelectionState(cookieKey: string) {
  return useConsoleSelection<ConsoleSelectionState>({
    cookieKey,
    defaultState: () => ({
      selectedId: '',
      mode: 'live',
    }),
    normalizeState: normalizeConsoleSelectionState,
  }).state
}

export function selectionKey<TState extends Record<string, any>, K extends keyof TState>(
  selection: { state: Ref<TState> },
  key: K
) {
  return computed(() => selection.state.value[key])
}
