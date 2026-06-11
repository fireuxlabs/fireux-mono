import type { ConsoleMode } from 'fireux-core/runtime/composables/fireux/app/console/useConsole'
import { useConsoleSelection } from 'fireux-core/runtime/composables/fireux/app/console/useConsoleSelection'

type PortfolioConsoleTargetInput = {
  selectedId?: string
  portfolioId?: string
  mode?: ConsoleMode
}

export function usePortfolioConsoleTargets() {
  const selection = useConsoleSelection({ family: 'portfolio' })

  const setPortfolioConsoleTarget = (selectionPatch: PortfolioConsoleTargetInput = {}) => {
    selection.setSelection({
      selectedId: selectionPatch.selectedId,
      id: selectionPatch.portfolioId,
      mode: selectionPatch.mode,
    })
  }

  return {
    selectedId: selection.selectedId,
    mode: selection.mode,
    setPortfolioConsoleTarget,
    clearPortfolioConsoleTarget: selection.clearSelection,
  }
}
