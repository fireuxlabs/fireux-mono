import { useWorkspace } from 'fireux-core/runtime/composables/fireux/workspace/useWorkspace'
import { normalizeString } from 'fireux-core/runtime/utils/string'

type PortfolioWorkspaceSelectionInput = {
  selectedId?: string
  portfolioId?: string
}

export function usePortfolioWorkspaceSelection() {
  const { selectedId, select, clear } = useWorkspace('portfolio')

  const setPortfolioWorkspaceSelection = (
    selectionPatch: PortfolioWorkspaceSelectionInput = {}
  ) => {
    const hasNextId =
      selectionPatch.selectedId !== undefined ||
      selectionPatch.portfolioId !== undefined
    const nextId = hasNextId
      ? normalizeString(selectionPatch.selectedId ?? selectionPatch.portfolioId)
      : selectedId.value

    select(nextId)
  }

  return {
    selectedId,
    setPortfolioWorkspaceSelection,
    clearPortfolioWorkspaceSelection: clear,
  }
}
