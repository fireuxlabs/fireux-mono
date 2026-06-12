import { useConsoleSelection } from 'fireux-core/runtime/composables/fireux/app/console/useConsoleSelection'

type PortfolioConsoleTargetInput = {
  selectedId?: string
  portfolioId?: string
}

export function usePortfolioConsoleTargets() {
  const selection = useConsoleSelection({ family: 'portfolio' })

  const setPortfolioConsoleTarget = (selectionPatch: PortfolioConsoleTargetInput = {}) => {
    selection.setSelection({
      selectedId: selectionPatch.selectedId,
      id: selectionPatch.portfolioId,
    })
  }

  return {
    selectedId: selection.selectedId,
    setPortfolioConsoleTarget,
    clearPortfolioConsoleTarget: selection.clearSelection,
  }
}
