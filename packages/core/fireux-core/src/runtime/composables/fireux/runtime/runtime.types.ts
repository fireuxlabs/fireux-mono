import type { ComputedRef, Ref } from 'vue'

export type ConsoleFamily = 'projects' | 'kitchen' | 'portfolio' | 'supplier'

/**
 * Canon runtime modes (shared across all entities).
 * - read-only => scenario/demo only (NO Firestore)
 * - live => production Firestore
 * - test => test Firestore
 */
export type RuntimeMode = 'live' | 'read-only' | 'test'

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

export type RuntimeTarget = {
  family: ConsoleFamily
  id: string
  mode: RuntimeMode
}
