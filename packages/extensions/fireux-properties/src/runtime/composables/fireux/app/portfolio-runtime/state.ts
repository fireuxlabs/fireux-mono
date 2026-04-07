import { normalizeMode, normalizeString, type RuntimePortfolioMode } from './shared'
import { createRuntimeEntitySelection } from 'fireux-core/runtime/composables/fireux/runtime/useRuntimeSelection'

type RuntimePortfolioSelectionState = {
  selectedId: string
  mode: RuntimePortfolioMode
}

type RuntimePortfolioSelectionInput = Partial<RuntimePortfolioSelectionState> & {
  portfolioId?: string
}

const COOKIE_KEY = 'fireux_runtime_portfolio'
const usePortfolioSelectionBase = createRuntimeEntitySelection<RuntimePortfolioMode, 'portfolioId'>({
  cookieKey: COOKIE_KEY,
  aliasKey: 'portfolioId',
  defaultMode: 'demo',
  normalizeMode: (value) => normalizeMode(value) ?? 'demo',
  normalizeId: normalizeString,
})

export function useRuntimePortfolioSelection() {
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
