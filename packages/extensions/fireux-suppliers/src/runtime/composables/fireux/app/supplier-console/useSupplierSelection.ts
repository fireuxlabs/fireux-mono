import {
  useConsole,
  type ConsoleMode,
} from 'fireux-core/runtime/composables/fireux/app/console/useConsole'

type RuntimeSupplierSelectionInput = {
  selectedId?: string
  supplierId?: string
  mode?: ConsoleMode
}

const normalizeString = (value: unknown) => String(value ?? '').trim()

export function useSupplierSelection() {
  const { selectedId, selectedMode, selectEntity, clearSelection } =
    useConsole('suppliers')

  const setRuntimeSupplier = (selectionPatch: RuntimeSupplierSelectionInput = {}) => {
    const nextId =
      selectionPatch.selectedId !== undefined || selectionPatch.supplierId !== undefined
        ? normalizeString(selectionPatch.selectedId ?? selectionPatch.supplierId)
        : selectedId.value

    const nextMode = selectionPatch.mode ?? selectedMode.value

    selectEntity(nextId, nextMode)
  }

  const clearRuntimeSupplier = () => {
    clearSelection()
  }

  return {
    selectedId,
    mode: selectedMode,
    setRuntimeSupplier,
    clearRuntimeSupplier,
  }
}
