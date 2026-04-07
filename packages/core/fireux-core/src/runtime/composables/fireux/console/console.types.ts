import type { ComputedRef, Ref } from 'vue'

export type ConsoleFamily = string

/**
 * Canon console modes (shared across all entities).
 * - demo => sample/demo data source
 * - live => production Firestore
 * - test => test Firestore
 */
export type ConsoleMode = 'live' | 'demo' | 'test'
export type ConsoleActivity = 'static' | 'simulation'

export type ConsoleHeaderData = {
  imageUrl?: string
  title: string
  subtitle?: string
} | null

export type ConsoleModeOption = {
  value: ConsoleMode
  label: string
}

export type ConsoleRefBase = {
  id: ComputedRef<string>
  mode: ComputedRef<ConsoleMode>
  activity: ComputedRef<ConsoleActivity>
  isDemo: ComputedRef<boolean>
  isLoading: ComputedRef<boolean>
  isReady: ComputedRef<boolean>
}

export type ConsoleContextRef = {
  id: ComputedRef<string>
  mode: ComputedRef<ConsoleMode>
  activity: ComputedRef<ConsoleActivity>
  isDemo: ComputedRef<boolean>
}

export type ConsoleSelectionApi<TState extends Record<string, any>> = {
  state: Ref<TState>
  set: (patch?: Partial<TState>) => void
  clear: () => void
}

export type ConsoleSelectionState = {
  selectedId: string
  mode: ConsoleMode
}

export type ConsoleStateApi = {
  family: ConsoleFamily
  selectedId: ComputedRef<string>
  mode: ComputedRef<ConsoleMode>
  modeOptions: readonly ConsoleModeOption[]
  hasSelection: ComputedRef<boolean>
  header: ComputedRef<ConsoleHeaderData>
  selectMode: (value: string) => void
  clearSelection: () => void
}

export type ConsoleTarget = {
  family: ConsoleFamily
  id: string
  mode: ConsoleMode
}
