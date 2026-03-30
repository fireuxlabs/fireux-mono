import { computed } from 'vue'
import { normalizeMode, normalizeString, type RuntimePortfolioMode } from './shared'
import { selectionKey, useRuntimeSelection } from 'fireux-core/runtime/composables/fireux/runtime/useRuntimeSelection'

type RuntimePortfolioSelectionState = {
  selectedId: string
  mode: RuntimePortfolioMode
}

type RuntimePortfolioSelectionInput = Partial<RuntimePortfolioSelectionState> & {
  portfolioId?: string
}

const COOKIE_KEY = 'fireux_runtime_portfolio'

const normalizeSelectionState = (value: unknown): RuntimePortfolioSelectionState => {
  const source = value && typeof value === 'object' ? (value as Record<string, unknown>) : {}
  return {
    selectedId: normalizeString(source.selectedId ?? source.portfolioId),
    mode: normalizeMode(source.mode) ?? 'live',
  }
}

export function useRuntimePortfolioSelection() {
  const selection = useRuntimeSelection<RuntimePortfolioSelectionState>({
    cookieKey: COOKIE_KEY,
    defaultState: () => ({ selectedId: '', mode: 'live' }),
    normalizeState: normalizeSelectionState,
  })

  const setRuntimePortfolio = (selectionPatch: RuntimePortfolioSelectionInput = {}) => {
    const next: RuntimePortfolioSelectionState = {
      selectedId:
        selectionPatch.selectedId !== undefined || selectionPatch.portfolioId !== undefined
          ? normalizeString(selectionPatch.selectedId ?? selectionPatch.portfolioId)
          : selection.state.value.selectedId,
      mode:
        selectionPatch.mode !== undefined
          ? normalizeMode(selectionPatch.mode) ?? selection.state.value.mode
          : selection.state.value.mode,
    }

    selection.set(next)
  }

  const clearRuntimePortfolio = () => {
    selection.clear()
  }

  const selectedId = selectionKey(selection, 'selectedId')
  const mode = computed(() => normalizeMode(selection.state.value.mode) ?? 'live')

  return {
    selectedId,
    mode,
    runtimePortfolioId: selectedId,
    runtimePortfolioMode: mode,
    setRuntimePortfolio,
    clearRuntimePortfolio,
  }
}
