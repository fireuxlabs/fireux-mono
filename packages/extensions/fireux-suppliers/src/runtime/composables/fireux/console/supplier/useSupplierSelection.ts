import type { ConsoleMode } from 'fireux-core/runtime/composables/fireux/app/console/useConsole'
import { useConsoleSelection } from 'fireux-core/runtime/composables/fireux/app/console/useConsoleSelection'

type RuntimeSupplierSelectionInput = {
  selectedId?: string
  supplierId?: string
  mode?: ConsoleMode
}

export function useSupplierSelection() {
  const selection = useConsoleSelection({ family: 'supplier' })

  const setRuntimeSupplier = (selectionPatch: RuntimeSupplierSelectionInput = {}) => {
    selection.setSelection({
      selectedId: selectionPatch.selectedId,
      id: selectionPatch.supplierId,
      mode: selectionPatch.mode,
    })
  }

  return {
    selectedId: selection.selectedId,
    mode: selection.mode,
    setRuntimeSupplier,
    clearRuntimeSupplier: selection.clearSelection,
  }
}
