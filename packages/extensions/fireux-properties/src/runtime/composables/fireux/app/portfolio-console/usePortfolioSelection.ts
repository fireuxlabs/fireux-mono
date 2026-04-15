import {
  normalizeConsoleMode,
  normalizeString,
} from 'fireux-core/runtime/composables/fireux/console/console.normalize'
import type { ConsoleMode } from 'fireux-core/runtime/composables/fireux/console/console.types'
import {
  selectionKey,
  useConsoleSelection,
} from 'fireux-core/runtime/composables/fireux/console/useConsoleSelection'
import { toConsoleSelectionStateKey } from 'fireux-core/runtime/composables/fireux/app/routing/consoleRoutes'

type PortfolioSelectionState = {
  selectedId: string
  mode: ConsoleMode
}

type RuntimePortfolioSelectionInput = {
  selectedId?: string
  portfolioId?: string
  mode?: ConsoleMode
}

const COOKIE_KEY = toConsoleSelectionStateKey('portfolios')

const normalizeSelectionState = (value: unknown): PortfolioSelectionState => {
  const source = value && typeof value === 'object' ? (value as Record<string, unknown>) : {}

  return {
    selectedId: normalizeString(source.selectedId ?? source.portfolioId),
    mode: normalizeConsoleMode(source.mode, { defaultMode: 'live' }),
  }
}

export function usePortfolioSelection() {
  const selection = useConsoleSelection<PortfolioSelectionState>({
    cookieKey: COOKIE_KEY,
    defaultState: () => ({ selectedId: '', mode: 'live' }),
    normalizeState: normalizeSelectionState,
  })

  const selectedId = selectionKey(selection, 'selectedId')
  const mode = selectionKey(selection, 'mode')

  const setRuntimePortfolio = (selectionPatch: RuntimePortfolioSelectionInput = {}) => {
    const nextId =
      selectionPatch.selectedId !== undefined || selectionPatch.portfolioId !== undefined
        ? normalizeString(selectionPatch.selectedId ?? selectionPatch.portfolioId)
        : selectedId.value
    const nextMode =
      selectionPatch.mode !== undefined
        ? normalizeConsoleMode(selectionPatch.mode, { defaultMode: mode.value })
        : mode.value

    selection.set({ selectedId: nextId, mode: nextMode })
  }

  const clearRuntimePortfolio = () => {
    selection.clear()
  }

  return {
    selectedId,
    mode,
    setRuntimePortfolio,
    clearRuntimePortfolio,
  }
}
