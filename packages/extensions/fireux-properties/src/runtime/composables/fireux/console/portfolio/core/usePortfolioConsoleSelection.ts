import { useConsoleSelection } from 'fireux-core/runtime/composables/fireux/app/console/useConsoleSelection'

type PortfolioConsoleSelectionInput = {
  selectedId?: string
  portfolioId?: string
}

export function usePortfolioConsoleSelection() {
  const selection = useConsoleSelection({ family: 'portfolio' })

  const setPortfolioConsoleSelection = (selectionPatch: PortfolioConsoleSelectionInput = {}) => {
    selection.setSelection({
      selectedId: selectionPatch.selectedId,
      id: selectionPatch.portfolioId,
    })
  }

  return {
    selectedId: selection.selectedId,
    setPortfolioConsoleSelection,
    clearPortfolioConsoleSelection: selection.clearSelection,
  }
}
