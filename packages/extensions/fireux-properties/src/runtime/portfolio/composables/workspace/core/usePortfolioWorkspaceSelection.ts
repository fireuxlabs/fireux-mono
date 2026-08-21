import { useWorkspaceSelection } from 'fireux-core/runtime/composables/fireux/workspace/useWorkspaceSelection'
import { normalizeString } from 'fireux-core/runtime/utils/string'

type PortfolioWorkspaceSelectionInput = {
  selectedId?: string
  portfolioId?: string
}

export function usePortfolioWorkspaceSelection() {
  const { selectedId, selectTarget, clearSelection } =
    useWorkspaceSelection('portfolio')

  const setPortfolioWorkspaceSelection = (
    selectionPatch: PortfolioWorkspaceSelectionInput = {}
  ) => {
    const hasNextId =
      selectionPatch.selectedId !== undefined ||
      selectionPatch.portfolioId !== undefined
    const nextId = hasNextId
      ? normalizeString(selectionPatch.selectedId ?? selectionPatch.portfolioId)
      : selectedId.value

    selectTarget(nextId, 'live')
  }

  return {
    selectedId,
    setPortfolioWorkspaceSelection,
    clearPortfolioWorkspaceSelection: clearSelection,
  }
}
