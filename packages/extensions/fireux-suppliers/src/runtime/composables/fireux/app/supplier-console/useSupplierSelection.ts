import { computed } from 'vue'
import type { ConsoleMode } from 'fireux-core/runtime/composables/fireux/console/console.types'
import {
  selectionKey,
  useConsoleSelection,
} from 'fireux-core/runtime/composables/fireux/console/useConsoleSelection'

type SupplierSelectionState = {
  selectedId: string
}

type RuntimeSupplierSelectionInput = Partial<SupplierSelectionState> & {
  supplierId?: string
  mode?: ConsoleMode
}

const COOKIE_KEY = 'fireux_runtime_supplier'

const normalizeString = (value: unknown): string => String(value || '').trim()

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

  const setRuntimeSupplier = (selectionPatch: RuntimeSupplierSelectionInput = {}) =>
    selection.set({
      selectedId:
        selectionPatch.selectedId !== undefined || selectionPatch.supplierId !== undefined
          ? normalizeString(selectionPatch.selectedId ?? selectionPatch.supplierId)
          : selectedId.value,
    })
  const clearRuntimeSupplier = () => selection.clear()

  return {
    selectedId,
    mode,
    runtimeSupplierId: selectedId,
    runtimeSupplierMode: mode,
    setRuntimeSupplier,
    clearRuntimeSupplier,
  }
}
