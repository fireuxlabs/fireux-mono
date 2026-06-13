import { useConsoleSelection } from 'fireux-core/runtime/composables/fireux/app/console/useConsoleSelection'
import { normalizeString } from 'fireux-core/runtime/utils/string'

type PortfolioConsoleSelectionInput = {
  selectedId?: string
  portfolioId?: string
}

export function usePortfolioConsoleSelection() {
  const { selectedId, selectTarget, clearSelection } =
    useConsoleSelection('portfolio')

  const setPortfolioConsoleSelection = (selectionPatch: PortfolioConsoleSelectionInput = {}) => {
    const hasNextId =
      selectionPatch.selectedId !== undefined ||
      selectionPatch.portfolioId !== undefined
    const nextId = hasNextId
      ? normalizeString(selectionPatch.selectedId ?? selectionPatch.portfolioId)
      : selectedId.value

    selectTarget(nextId)
  }

  return {
    selectedId,
    setPortfolioConsoleSelection,
    clearPortfolioConsoleSelection: clearSelection,
  }
}
