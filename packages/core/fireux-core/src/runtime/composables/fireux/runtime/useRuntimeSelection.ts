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

  const normalize = (value: unknown) => params.normalizeState(value)
  const sameState = (left: unknown, right: unknown) =>
    JSON.stringify(normalize(left)) === JSON.stringify(normalize(right))

  // On full page reload, Nuxt can hydrate useState from a server-side cookie view that
  // differs from the browser cookie already holding the current console selection.
  // Rehydrate only when the normalized browser cookie and hydrated state diverge.
  if (import.meta.client && !sameState(state.value, cookie.value)) {
    state.value = normalize(cookie.value)
  }

  // keep cookie in sync with normalized state
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
