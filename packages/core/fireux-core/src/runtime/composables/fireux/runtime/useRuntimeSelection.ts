import { useCookie, useState } from '#imports'
import type { Ref } from 'vue'
import { computed } from 'vue'
import type { RuntimeSelectionApi } from './runtime.types'

type UseRuntimeSelectionParams<TState extends Record<string, any>> = {
  cookieKey: string
  defaultState: () => TState
  normalizeState: (value: unknown) => TState
}

/**
 * Shared cookie+state selection store.
 * Entity wrappers keep their own naming (useRuntimeKitchenSelection, etc.)
 * but call this internally.
 */
export function useRuntimeSelection<TState extends Record<string, any>>(
  params: UseRuntimeSelectionParams<TState>
): RuntimeSelectionApi<TState> & { state: Ref<TState> } {
  const cookie = useCookie<TState>(params.cookieKey, {
    default: params.defaultState,
    sameSite: 'lax',
  })

  const state = useState<TState>(params.cookieKey, () => params.normalizeState(cookie.value))

  // keep cookie in sync with normalized state
  cookie.value = params.normalizeState(state.value)

  const set = (patch: Partial<TState> = {}) => {
    const next = params.normalizeState({ ...(state.value as any), ...(patch as any) })
    state.value = next
    cookie.value = next
  }

  const clear = () => {
    const next = params.normalizeState(params.defaultState())
    state.value = next
    cookie.value = next
  }

  return {
    state,
    set,
    clear,
  }
}

/**
 * Small helper: create a computed accessor for a key on selection state.
 * Keeps the wrapper code tidy.
 */
export function selectionKey<TState extends Record<string, any>, K extends keyof TState>(
  selection: { state: Ref<TState> },
  key: K
) {
  return computed(() => selection.state.value[key])
}
