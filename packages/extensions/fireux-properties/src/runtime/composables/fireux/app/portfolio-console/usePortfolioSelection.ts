import {
  useConsole,
  type ConsoleMode,
} from 'fireux-core/runtime/composables/fireux/console/useConsole'

type RuntimePortfolioSelectionInput = {
  selectedId?: string
  portfolioId?: string
  mode?: ConsoleMode
}

const normalizeString = (value: unknown) => String(value ?? '').trim()

export function usePortfolioSelection() {
  const { selectedId, selectedMode, selectEntity, clearSelection } =
    useConsole('portfolios')

  const setRuntimePortfolio = (selectionPatch: RuntimePortfolioSelectionInput = {}) => {
    const nextId =
      selectionPatch.selectedId !== undefined || selectionPatch.portfolioId !== undefined
        ? normalizeString(selectionPatch.selectedId ?? selectionPatch.portfolioId)
        : selectedId.value

    const nextMode = selectionPatch.mode ?? selectedMode.value

    selectEntity(nextId, nextMode)
  }

  const clearRuntimePortfolio = () => {
    clearSelection()
  }

  return {
    selectedId,
    mode: selectedMode,
    setRuntimePortfolio,
    clearRuntimePortfolio,
  }
}
