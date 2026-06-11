import type { ConsoleMode } from 'fireux-core/runtime/composables/fireux/app/console/useConsole'
import { useConsoleSelection } from 'fireux-core/runtime/composables/fireux/app/console/useConsoleSelection'

type SupplierConsoleTargetInput = {
  selectedId?: string
  supplierId?: string
  mode?: ConsoleMode
}

export function useSupplierConsoleTargets() {
  const selection = useConsoleSelection({ family: 'supplier' })

  const setSupplierConsoleTarget = (selectionPatch: SupplierConsoleTargetInput = {}) => {
    selection.setSelection({
      selectedId: selectionPatch.selectedId,
      id: selectionPatch.supplierId,
      mode: selectionPatch.mode,
    })
  }

  return {
    selectedId: selection.selectedId,
    mode: selection.mode,
    setSupplierConsoleTarget,
    clearSupplierConsoleTarget: selection.clearSelection,
  }
}
