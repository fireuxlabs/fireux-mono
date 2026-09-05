import { useWorkspace } from 'fireux-core/runtime/composables/fireux/workspace/useWorkspace'
import { normalizeString } from 'fireux-core/runtime/utils/string'

type KitchenWorkspaceSelectionInput = {
  selectedId?: string
  kitchenId?: string
}

export function useKitchenWorkspaceSelection() {
  const { selectedId, select, clear } = useWorkspace('kitchen')

  const setKitchenWorkspaceSelection = (
    selectionPatch: KitchenWorkspaceSelectionInput = {}
  ) => {
    const hasNextId =
      selectionPatch.selectedId !== undefined ||
      selectionPatch.kitchenId !== undefined
    const nextId = hasNextId
      ? normalizeString(selectionPatch.selectedId ?? selectionPatch.kitchenId)
      : selectedId.value

    select(nextId)
  }

  return {
    selectedId,
    setKitchenWorkspaceSelection,
    clearKitchenWorkspaceSelection: clear,
  }
}
