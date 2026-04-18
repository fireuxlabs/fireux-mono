import { useState } from '#imports'
import { computed } from 'vue'

export type ConsoleMode = 'live' | 'demo' | 'test'

type ConsoleState = {
  selectedId: string
  selectedMode: ConsoleMode
}

const normalizeFamily = (value: unknown) => String(value ?? '').trim()
const normalizeString = (value: unknown) => String(value ?? '').trim()

export function useConsole(family: string) {
  const state = useState<ConsoleState>(`console:${normalizeFamily(family)}`, () => ({
    selectedId: '',
    selectedMode: 'live',
  }))

  const selectedId = computed(() => normalizeString(state.value.selectedId))
  const selectedMode = computed(() => state.value.selectedMode)

  const selectEntity = (id: string, mode: ConsoleMode = selectedMode.value) => {
    state.value = {
      selectedId: normalizeString(id),
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
