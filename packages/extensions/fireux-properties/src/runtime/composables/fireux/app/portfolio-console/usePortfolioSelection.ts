import { computed } from 'vue'
import type { ConsoleMode } from 'fireux-core/runtime/composables/fireux/console/console.types'
import {
  selectionKey,
  useConsoleSelection,
} from 'fireux-core/runtime/composables/fireux/console/useConsoleSelection'
import { normalizeString } from './shared'

type PortfolioSelectionState = {
  selectedId: string
}

type RuntimePortfolioSelectionInput = {
  selectedId?: string
  portfolioId?: string
  mode?: ConsoleMode
}

const COOKIE_KEY = 'fireux_runtime_portfolio'

const normalizeSelectionState = (value: unknown): PortfolioSelectionState => {
  const source = value && typeof value === 'object' ? (value as Record<string, unknown>) : {}

  return {
    selectedId: normalizeString(source.selectedId ?? source.portfolioId),
  }
}

export function usePortfolioSelection() {
  const selection = useConsoleSelection<PortfolioSelectionState>({
    cookieKey: COOKIE_KEY,
    defaultState: () => ({ selectedId: '' }),
    normalizeState: normalizeSelectionState,
  })

  const selectedId = selectionKey(selection, 'selectedId')
  const mode = computed<ConsoleMode>(() => 'live')

  const setRuntimePortfolio = (selectionPatch: RuntimePortfolioSelectionInput = {}) => {
    const nextId =
      selectionPatch.selectedId !== undefined || selectionPatch.portfolioId !== undefined
        ? normalizeString(selectionPatch.selectedId ?? selectionPatch.portfolioId)
        : selectedId.value

    selection.set({ selectedId: nextId })
  }

  const clearRuntimePortfolio = () => {
    selection.clear()
  }

  return {
    selectedId,
    mode,
    runtimePortfolioId: selectedId,
    runtimePortfolioMode: mode,
    setRuntimePortfolio,
    clearRuntimePortfolio,
  }
}
