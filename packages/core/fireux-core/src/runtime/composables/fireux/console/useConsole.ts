import { useState } from '#imports'
import { computed } from 'vue'

type ConsoleMode = 'live' | 'demo' | 'test'

type ConsoleState = {
  selectedId: string
  selectedMode: ConsoleMode
}

export function useConsole(family: string) {
  const state = useState<ConsoleState>(`console:${String(family || '').trim()}`, () => ({
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
