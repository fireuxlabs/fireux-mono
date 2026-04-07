import { useCookie, useState } from '#imports'
import type { Ref } from 'vue'
import { computed } from 'vue'
import type { ConsoleSelectionApi } from './console.types'

type UseConsoleSelectionParams<TState extends Record<string, any>> = {
  cookieKey: string
  defaultState: () => TState
  normalizeState: (value: unknown) => TState
}

/**
 * Shared cookie+state selection store.
 * Entity wrappers keep their own naming (useKitchenSelection, etc.)
 * but call this internally.
 */
export function useConsoleSelection<TState extends Record<string, any>>(
  params: UseConsoleSelectionParams<TState>
): ConsoleSelectionApi<TState> & { state: Ref<TState> } {
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

type ConsoleEntitySelectionState<TMode extends string> = {
  selectedId: string
  mode: TMode
}

type CreateConsoleEntitySelectionParams<TMode extends string, TAlias extends string> = {
  cookieKey: string
  aliasKey: TAlias
  defaultMode: TMode
  normalizeMode: (value: unknown) => TMode | undefined
  normalizeId?: (value: unknown) => string
}

type ConsoleEntitySelectionInput<TMode extends string, TAlias extends string> =
  Partial<ConsoleEntitySelectionState<TMode>> & {
    [K in TAlias]?: string
  }

/**
 * Small factory for entity-specific runtime selectors.
 * Wrappers keep their domain names but share the same implementation.
 */
export function createConsoleEntitySelection<TMode extends string, TAlias extends string>(
  params: CreateConsoleEntitySelectionParams<TMode, TAlias>
) {
  type SelectionState = ConsoleEntitySelectionState<TMode>
  type SelectionInput = ConsoleEntitySelectionInput<TMode, TAlias>

  const normalizeId = params.normalizeId ?? ((value: unknown) => String(value ?? '').trim())

  const normalizeState = (value: unknown): SelectionState => {
    const source = value && typeof value === 'object' ? (value as Record<string, unknown>) : {}
    return {
      selectedId: normalizeId(source.selectedId ?? source[params.aliasKey]),
      mode: params.normalizeMode(source.mode) ?? params.defaultMode,
    }
  }

  return function useEntitySelection() {
    const selection = useConsoleSelection<SelectionState>({
      cookieKey: params.cookieKey,
      defaultState: () => ({ selectedId: '', mode: params.defaultMode }),
      normalizeState,
    })

    const setSelection = (selectionPatch: SelectionInput = {} as SelectionInput) => {
      const aliasValue = selectionPatch[params.aliasKey]

      const next: SelectionState = {
        selectedId:
          selectionPatch.selectedId !== undefined || aliasValue !== undefined
            ? normalizeId(selectionPatch.selectedId ?? aliasValue)
            : selection.state.value.selectedId,
        mode:
          selectionPatch.mode !== undefined
            ? params.normalizeMode(selectionPatch.mode) ?? selection.state.value.mode
            : selection.state.value.mode,
      }

      selection.set(next)
    }

    const clearSelection = () => {
      selection.clear()
    }

    const selectedId = selectionKey(selection, 'selectedId')
    const mode = computed(() => params.normalizeMode(selection.state.value.mode) ?? params.defaultMode)

    return {
      selectedId,
      mode,
      setSelection,
      clearSelection,
    }
  }
}
