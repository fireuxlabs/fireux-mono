import type { ComputedRef, Ref } from 'vue'

export type ConsoleFamily = string

/**
 * Canon runtime modes (shared across all entities).
 * - demo => sample/demo data source
 * - live => production Firestore
 * - test => test Firestore
 */
export type RuntimeMode = 'live' | 'demo' | 'test'
export type RuntimeActivity = 'static' | 'simulation'

export type RuntimeConsoleHeaderData = {
  imageUrl?: string
  title: string
  subtitle?: string
} | null

export type RuntimeModeOption = {
  value: RuntimeMode
  label: string
}

export type RuntimeRefBase = {
  id: ComputedRef<string>
  mode: ComputedRef<RuntimeMode>
  activity: ComputedRef<RuntimeActivity>
  isDemo: ComputedRef<boolean>
  isLoading: ComputedRef<boolean>
  isReady: ComputedRef<boolean>
}

export type RuntimeContextRef = {
  id: ComputedRef<string>
  mode: ComputedRef<RuntimeMode>
  activity: ComputedRef<RuntimeActivity>
  isDemo: ComputedRef<boolean>
}

export type RuntimeSelectionApi<TState extends Record<string, any>> = {
  state: Ref<TState>
  set: (patch?: Partial<TState>) => void
  clear: () => void
}

export type RuntimeSelectionState = {
  selectedId: string
  mode: RuntimeMode
}

export type RuntimeConsoleApi = {
  family: ConsoleFamily
  selectedId: ComputedRef<string>
  mode: ComputedRef<RuntimeMode>
  modeOptions: readonly RuntimeModeOption[]
  hasSelection: ComputedRef<boolean>
  header: ComputedRef<RuntimeConsoleHeaderData>
  selectMode: (value: string) => void
  clearSelection: () => void
}

export type RuntimeTarget = {
  family: ConsoleFamily
  id: string
  mode: RuntimeMode
}
