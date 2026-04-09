import { computed } from 'vue'
import { normalizeString } from 'fireux-core/runtime/composables/fireux/console/console.normalize'
import type { ConsoleMode } from 'fireux-core/runtime/composables/fireux/console/console.types'
import {
  selectionKey,
  useConsoleSelection,
} from 'fireux-core/runtime/composables/fireux/console/useConsoleSelection'
import { toConsoleSelectionStateKey } from 'fireux-core/runtime/composables/fireux/app/routing/consoleRoutes'

type SupplierSelectionState = {
  selectedId: string
}

type RuntimeSupplierSelectionInput = {
  selectedId?: string
  supplierId?: string
  mode?: ConsoleMode
}

const COOKIE_KEY = toConsoleSelectionStateKey('supplier')

const normalizeSelectionState = (value: unknown): SupplierSelectionState => {
  const source = value && typeof value === 'object' ? (value as Record<string, unknown>) : {}

  return {
    selectedId: normalizeString(source.selectedId ?? source.supplierId),
  }
}

export function useSupplierSelection() {
  const selection = useConsoleSelection<SupplierSelectionState>({
    cookieKey: COOKIE_KEY,
    defaultState: () => ({ selectedId: '' }),
    normalizeState: normalizeSelectionState,
  })

  const selectedId = selectionKey(selection, 'selectedId')
  const mode = computed<ConsoleMode>(() => 'live')

  const setRuntimeSupplier = (selectionPatch: RuntimeSupplierSelectionInput = {}) => {
    const nextId =
      selectionPatch.selectedId !== undefined || selectionPatch.supplierId !== undefined
        ? normalizeString(selectionPatch.selectedId ?? selectionPatch.supplierId)
        : selectedId.value

    selection.set({ selectedId: nextId })
  }

  const clearRuntimeSupplier = () => {
    selection.clear()
  }

  return {
    selectedId,
    mode,
    runtimeSupplierId: selectedId,
    runtimeSupplierMode: mode,
    setRuntimeSupplier,
    clearRuntimeSupplier,
  }
}
