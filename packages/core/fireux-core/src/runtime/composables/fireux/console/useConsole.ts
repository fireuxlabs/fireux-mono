import { useState } from '#imports'
import { computed, type ComputedRef, unref, watchEffect, type Ref } from 'vue'

export type ConsoleMode = 'live' | 'demo' | 'test'

export type ConsoleHeaderData = {
  title: string
  subtitle?: string
  imageUrl?: string
} | null

type ConsoleState = {
  selectedId: string
  selectedMode: ConsoleMode
}

type HeaderRef = Ref<ConsoleHeaderData> | ComputedRef<ConsoleHeaderData>

const normalizeFamily = (value: unknown) => String(value ?? '').trim()

export function useConsoleHeaders() {
  return useState<Record<string, ConsoleHeaderData>>('console:headers', () => ({}))
}

export function usePublishConsoleHeader(family: string, header: HeaderRef) {
  const consoleHeaders = useConsoleHeaders()
  const normalizedFamily = normalizeFamily(family)

  watchEffect(() => {
    consoleHeaders.value[normalizedFamily] = unref(header)
  })

  return consoleHeaders
}

export function useConsole(family: string) {
  const state = useState<ConsoleState>(`console:${normalizeFamily(family)}`, () => ({
    selectedId: '',
    selectedMode: 'live',
  }))

  const selectedId = computed(() => state.value.selectedId)
  const selectedMode = computed(() => state.value.selectedMode)

  const selectEntity = (id: string, mode: ConsoleMode = selectedMode.value) => {
    state.value = {
      selectedId: String(id || '').trim(),
      selectedMode: mode,
    }
  }

  const clearSelection = () => {
    state.value = {
      selectedId: '',
      selectedMode: 'live',
    }
  }

  return {
    selectedId,
    selectedMode,
    selectEntity,
    clearSelection,
  }
}
