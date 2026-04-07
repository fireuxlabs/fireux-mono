// console.types.ts
import type { ComputedRef, Ref } from 'vue'

export type ConsoleFamily = string

export type ConsoleMode = 'live' | 'demo' | 'test'

export type ConsoleHeaderData = {
  imageUrl?: string
  title: string
  subtitle?: string
} | null

export type ConsoleModeOption = {
  value: ConsoleMode
  label: string
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