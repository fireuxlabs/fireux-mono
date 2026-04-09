import { computed } from 'vue'
import { normalizeString } from 'fireux-core/runtime/composables/fireux/console/console.normalize'
import type { ConsoleMode } from 'fireux-core/runtime/composables/fireux/console/console.types'
import {
  selectionKey,
  useConsoleSelection,
} from 'fireux-core/runtime/composables/fireux/console/useConsoleSelection'
import { toConsoleSelectionStateKey } from 'fireux-core/runtime/composables/fireux/app/routing/consoleRoutes'

type KitchenSelectionState = {
  selectedId: string
}

type RuntimeKitchenSelectionInput = {
  selectedId?: string
  kitchenId?: string
  mode?: ConsoleMode
}

const COOKIE_KEY = toConsoleSelectionStateKey('kitchen')

const normalizeSelectionState = (value: unknown): KitchenSelectionState => {
  const source = value && typeof value === 'object' ? (value as Record<string, unknown>) : {}

  return {
    selectedId: normalizeString(source.selectedId ?? source.kitchenId),
  }
}

export function useKitchenSelection() {
  const selection = useConsoleSelection<KitchenSelectionState>({
    cookieKey: COOKIE_KEY,
    defaultState: () => ({ selectedId: '' }),
    normalizeState: normalizeSelectionState,
  })

  const selectedId = selectionKey(selection, 'selectedId')
  const mode = computed<ConsoleMode>(() => 'live')

  const setRuntimeKitchen = (selectionPatch: RuntimeKitchenSelectionInput = {}) => {
    const nextId =
      selectionPatch.selectedId !== undefined || selectionPatch.kitchenId !== undefined
        ? normalizeString(selectionPatch.selectedId ?? selectionPatch.kitchenId)
        : selectedId.value

    selection.set({ selectedId: nextId })
  }

  const clearRuntimeKitchen = () => {
    selection.clear()
  }

  return {
    selectedId,
    mode,
    runtimeKitchenId: selectedId,
    runtimeKitchenMode: mode,
    setRuntimeKitchen,
    clearRuntimeKitchen,
  }
}
