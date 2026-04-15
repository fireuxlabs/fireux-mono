import { toConsoleSelectionStateKey } from 'fireux-core/runtime/composables/fireux/app/routing/consoleRoutes'
import {
  normalizeConsoleMode,
  normalizeString,
} from 'fireux-core/runtime/composables/fireux/console/console.normalize'
import type { ConsoleMode } from 'fireux-core/runtime/composables/fireux/console/console.types'
import {
  selectionKey,
  useConsoleSelection,
} from 'fireux-core/runtime/composables/fireux/console/useConsoleSelection'

type KitchenSelectionState = {
  selectedId: string
  mode: ConsoleMode
}

type RuntimeKitchenSelectionInput = {
  selectedId?: string
  kitchenId?: string
  mode?: ConsoleMode
}

const COOKIE_KEY = toConsoleSelectionStateKey('kitchens')

const normalizeSelectionState = (value: unknown): KitchenSelectionState => {
  const source = value && typeof value === 'object' ? (value as Record<string, unknown>) : {}

  return {
    selectedId: normalizeString(source.selectedId ?? source.kitchenId),
    mode: normalizeConsoleMode(source.mode, { defaultMode: 'live' }),
  }
}

export function useKitchenSelection() {
  const selection = useConsoleSelection<KitchenSelectionState>({
    cookieKey: COOKIE_KEY,
    defaultState: () => ({ selectedId: '', mode: 'live' }),
    normalizeState: normalizeSelectionState,
  })

  const selectedId = selectionKey(selection, 'selectedId')
  const mode = selectionKey(selection, 'mode')

  const setRuntimeKitchen = (selectionPatch: RuntimeKitchenSelectionInput = {}) => {
    const nextId =
      selectionPatch.selectedId !== undefined || selectionPatch.kitchenId !== undefined
        ? normalizeString(selectionPatch.selectedId ?? selectionPatch.kitchenId)
        : selectedId.value
    const nextMode =
      selectionPatch.mode !== undefined
        ? normalizeConsoleMode(selectionPatch.mode, { defaultMode: mode.value })
        : mode.value

    selection.set({ selectedId: nextId, mode: nextMode })
  }

  const clearRuntimeKitchen = () => {
    selection.clear()
  }

  return {
    selectedId,
    mode,
    setRuntimeKitchen,
    clearRuntimeKitchen,
  }
}
