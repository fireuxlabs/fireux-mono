import { normalizeMode, normalizeString, type RuntimePortfolioMode } from './shared'
import { createConsoleEntitySelection } from 'fireux-core/runtime/composables/fireux/console/useConsoleSelection'

type RuntimePortfolioSelectionState = {
  selectedId: string
  mode: RuntimePortfolioMode
}

type RuntimePortfolioSelectionInput = Partial<RuntimePortfolioSelectionState> & {
  portfolioId?: string
}

const COOKIE_KEY = 'fireux_runtime_portfolio'
const usePortfolioSelectionBase = createConsoleEntitySelection<RuntimePortfolioMode, 'portfolioId'>({
  cookieKey: COOKIE_KEY,
  aliasKey: 'portfolioId',
  defaultMode: 'live',
  normalizeMode: (value) => normalizeMode(value) ?? 'live',
  normalizeId: normalizeString,
})

export function usePortfolioSelection() {
  const selection = usePortfolioSelectionBase()
  const setRuntimePortfolio = (selectionPatch: RuntimePortfolioSelectionInput = {}) =>
    selection.setSelection(selectionPatch)
  const clearRuntimePortfolio = () => selection.clearSelection()

  return {
    selectedId: selection.selectedId,
    mode: selection.mode,
    runtimePortfolioId: selection.selectedId,
    runtimePortfolioMode: selection.mode,
    setRuntimePortfolio,
    clearRuntimePortfolio,
  }
}
