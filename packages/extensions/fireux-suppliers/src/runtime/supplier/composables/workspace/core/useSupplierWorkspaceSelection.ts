import { useWorkspaceSelection } from 'fireux-core/runtime/composables/fireux/workspace/useWorkspaceSelection'
import { normalizeString } from 'fireux-core/runtime/utils/string'

type SupplierWorkspaceSelectionInput = {
  selectedId?: string
  supplierId?: string
}

export function useSupplierWorkspaceSelection() {
  const { selectedId, selectTarget, clearSelection } =
    useWorkspaceSelection('supplier')

  const setSupplierWorkspaceSelection = (selectionPatch: SupplierWorkspaceSelectionInput = {}) => {
    const hasNextId =
      selectionPatch.selectedId !== undefined ||
      selectionPatch.supplierId !== undefined
    const nextId = hasNextId
      ? normalizeString(selectionPatch.selectedId ?? selectionPatch.supplierId)
      : selectedId.value

    selectTarget(nextId, 'live')
  }

  return {
    selectedId,
    setSupplierWorkspaceSelection,
    clearSupplierWorkspaceSelection: clearSelection,
  }
}
