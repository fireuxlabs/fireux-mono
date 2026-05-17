import type { ConsoleMode } from 'fireux-core/runtime/composables/fireux/app/console/useConsole'
import { useConsoleSelection } from 'fireux-core/runtime/composables/fireux/app/console/useConsoleSelection'

type RuntimePortfolioSelectionInput = {
  selectedId?: string
  portfolioId?: string
  mode?: ConsoleMode
}

export function usePortfolioSelection() {
  const selection = useConsoleSelection({ family: 'portfolio' })

  const setRuntimePortfolio = (selectionPatch: RuntimePortfolioSelectionInput = {}) => {
    selection.setSelection({
      selectedId: selectionPatch.selectedId,
      id: selectionPatch.portfolioId,
      mode: selectionPatch.mode,
    })
  }

  return {
    selectedId: selection.selectedId,
    mode: selection.mode,
    setRuntimePortfolio,
    clearRuntimePortfolio: selection.clearSelection,
  }
}
