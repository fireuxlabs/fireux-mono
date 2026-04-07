import { computed } from 'vue'
import type { ConsoleMode } from 'fireux-core/runtime/composables/fireux/console/console.types'
import {
  selectionKey,
  useConsoleSelection,
} from 'fireux-core/runtime/composables/fireux/console/useConsoleSelection'
import { normalizeString } from './shared'

type KitchenSelectionState = {
  selectedId: string
}

type RuntimeKitchenSelectionInput = Partial<KitchenSelectionState> & {
  kitchenId?: string
  mode?: ConsoleMode
}

const COOKIE_KEY = 'fireux_runtime_kitchen'

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

  const setRuntimeKitchen = (selectionPatch: RuntimeKitchenSelectionInput = {}) =>
    selection.set({
      selectedId:
        selectionPatch.selectedId !== undefined || selectionPatch.kitchenId !== undefined
          ? normalizeString(selectionPatch.selectedId ?? selectionPatch.kitchenId)
          : selectedId.value,
    })
  const clearRuntimeKitchen = () => selection.clear()

  return {
    selectedId,
    mode,
    runtimeKitchenId: selectedId,
    runtimeKitchenMode: mode,
    setRuntimeKitchen,
    clearRuntimeKitchen,
  }
}
