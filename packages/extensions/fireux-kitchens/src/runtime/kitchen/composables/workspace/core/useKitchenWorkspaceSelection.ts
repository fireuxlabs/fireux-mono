import {
  useWorkspaceSelection,
} from 'fireux-core/runtime/composables/fireux/workspace/useWorkspaceSelection'
import type {
  WorkspaceSource,
} from 'fireux-core/runtime/composables/fireux/workspace/useWorkspace'
import { normalizeString } from 'fireux-core/runtime/utils/string'

type KitchenWorkspaceSelectionInput = {
  selectedId?: string
  kitchenId?: string
  type?: WorkspaceSource
  /** Compatibility alias for callers written before Workspace data envelopes. */
  source?: WorkspaceSource
}

export function useKitchenWorkspaceSelection() {
  const { selectedId, selectTarget, clearSelection } =
    useWorkspaceSelection('kitchen')

  const setKitchenWorkspaceSelection = (selectionPatch: KitchenWorkspaceSelectionInput = {}) => {
    const hasNextId =
      selectionPatch.selectedId !== undefined ||
      selectionPatch.kitchenId !== undefined
    const nextId = hasNextId
      ? normalizeString(selectionPatch.selectedId ?? selectionPatch.kitchenId)
      : selectedId.value

    selectTarget(
      nextId,
      selectionPatch.type ?? selectionPatch.source ?? 'live'
    )
  }

  return {
    selectedId,
    setKitchenWorkspaceSelection,
    clearKitchenWorkspaceSelection: clearSelection,
  }
}
