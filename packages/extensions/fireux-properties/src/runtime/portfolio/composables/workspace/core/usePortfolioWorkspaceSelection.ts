import { useWorkspace } from 'fireux-core/runtime/composables/fireux/workspace/useWorkspace'
import { normalizeString } from 'fireux-core/runtime/utils/string'

type PortfolioWorkspaceSelectionInput = {
  selectedId?: string
  portfolioId?: string
}

export function usePortfolioWorkspaceSelection() {
  const { activeId, activate, clearActive } = useWorkspace('portfolio')

  const setPortfolioWorkspaceSelection = (
    selectionPatch: PortfolioWorkspaceSelectionInput = {}
  ) => {
    const hasNextId =
      selectionPatch.selectedId !== undefined ||
      selectionPatch.portfolioId !== undefined
    const nextId = hasNextId
      ? normalizeString(selectionPatch.selectedId ?? selectionPatch.portfolioId)
      : activeId.value

    activate(nextId)
  }

  return {
    selectedId: activeId,
    setPortfolioWorkspaceSelection,
    clearPortfolioWorkspaceSelection: clearActive,
  }
}
