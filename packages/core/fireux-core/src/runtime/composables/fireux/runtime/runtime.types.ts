import type { ComputedRef, Ref } from 'vue'

/**
 * Canon runtime modes (shared across all entities).
 * - live      => Firestore live data
 * - read-only => scenario only (NO Firestore)
 */
export type RuntimeMode = 'live' | 'read-only'

export type RuntimeRefBase = {
  id: ComputedRef<string>
  mode: ComputedRef<RuntimeMode>
  isReadOnly: ComputedRef<boolean>
  isLoading: ComputedRef<boolean>
  isReady: ComputedRef<boolean>
}

export type RuntimeContextRef = {
  id: ComputedRef<string>
  mode: ComputedRef<RuntimeMode>
  isReadOnly: ComputedRef<boolean>
}

export type RuntimeSelectionApi<TState extends Record<string, any>> = {
  state: Ref<TState>
  set: (patch?: Partial<TState>) => void
  clear: () => void
}
