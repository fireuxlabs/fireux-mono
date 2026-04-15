import {
  normalizeConsoleMode,
  normalizeString,
} from 'fireux-core/runtime/composables/fireux/console/console.normalize'
import type { ConsoleMode } from 'fireux-core/runtime/composables/fireux/console/console.types'
import {
  selectionKey,
  useConsoleSelection,
} from 'fireux-core/runtime/composables/fireux/console/useConsoleSelection'
import { toConsoleSelectionStateKey } from 'fireux-core/runtime/composables/fireux/app/routing/consoleRoutes'

type SupplierSelectionState = {
  selectedId: string
  mode: ConsoleMode
}

type RuntimeSupplierSelectionInput = {
  selectedId?: string
  supplierId?: string
  mode?: ConsoleMode
}

const COOKIE_KEY = toConsoleSelectionStateKey('suppliers')

const normalizeSelectionState = (value: unknown): SupplierSelectionState => {
  const source = value && typeof value === 'object' ? (value as Record<string, unknown>) : {}

  return {
    selectedId: normalizeString(source.selectedId ?? source.supplierId),
    mode: normalizeConsoleMode(source.mode, { defaultMode: 'live' }),
  }
}

export function useSupplierSelection() {
  const selection = useConsoleSelection<SupplierSelectionState>({
    cookieKey: COOKIE_KEY,
    defaultState: () => ({ selectedId: '', mode: 'live' }),
    normalizeState: normalizeSelectionState,
  })

  const selectedId = selectionKey(selection, 'selectedId')
  const mode = selectionKey(selection, 'mode')

  const setRuntimeSupplier = (selectionPatch: RuntimeSupplierSelectionInput = {}) => {
    const nextId =
      selectionPatch.selectedId !== undefined || selectionPatch.supplierId !== undefined
        ? normalizeString(selectionPatch.selectedId ?? selectionPatch.supplierId)
        : selectedId.value
    const nextMode =
      selectionPatch.mode !== undefined
        ? normalizeConsoleMode(selectionPatch.mode, { defaultMode: mode.value })
        : mode.value

    selection.set({ selectedId: nextId, mode: nextMode })
  }

  const clearRuntimeSupplier = () => {
    selection.clear()
  }

  return {
    selectedId,
    mode,
    setRuntimeSupplier,
    clearRuntimeSupplier,
  }
}
