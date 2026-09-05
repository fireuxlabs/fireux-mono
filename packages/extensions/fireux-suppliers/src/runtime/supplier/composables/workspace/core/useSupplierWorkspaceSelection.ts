import { useWorkspace } from 'fireux-core/runtime/composables/fireux/workspace/useWorkspace'
import { normalizeString } from 'fireux-core/runtime/utils/string'

type SupplierWorkspaceSelectionInput = {
  selectedId?: string
  supplierId?: string
}

export function useSupplierWorkspaceSelection() {
  const { selectedId, select, clear } = useWorkspace('supplier')

  const setSupplierWorkspaceSelection = (
    selectionPatch: SupplierWorkspaceSelectionInput = {}
  ) => {
    const hasNextId =
      selectionPatch.selectedId !== undefined ||
      selectionPatch.supplierId !== undefined
    const nextId = hasNextId
      ? normalizeString(selectionPatch.selectedId ?? selectionPatch.supplierId)
      : selectedId.value

    select(nextId)
  }

  return {
    selectedId,
    setSupplierWorkspaceSelection,
    clearSupplierWorkspaceSelection: clear,
  }
}
