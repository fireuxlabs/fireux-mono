import { computed } from 'vue'
import type { Portfolio } from '../../../../models/portfolio.model'
import { usePortfolioSelection } from './usePortfolioSelection'
import { useActivePortfolio } from './useActivePortfolio'
import { usePortfolioInterface } from '../../firestore/portfolio/utils/view/usePortfolioInterface'
import { useConsoleEntityAdapter } from 'fireux-core/runtime/composables/fireux/console/useConsoleEntityAdapter'

type UsePortfolioConsoleOptions = {
  publishHeader?: boolean
}

/**
 * Portfolio console adapter.
 * Keeps only the active pill, header data, and shared console-state wiring.
 */
export function usePortfolioConsole(
  options: UsePortfolioConsoleOptions = {}
) {
  const portfolioState = useActivePortfolio()
  const portfolioSelection = usePortfolioSelection()
  const { pill: toPortfolioCard } = usePortfolioInterface()

  const portfolio = computed(() =>
    toPortfolioCard(portfolioState.entity.value as Portfolio | null)
  )

  const { headerData, consoleState } = useConsoleEntityAdapter({
    family: 'portfolios',
    selectedId: portfolioState.id,
    mode: portfolioState.mode,
    setMode: (mode) => portfolioSelection.setRuntimePortfolio({ mode }),
    clearSelection: portfolioSelection.clearRuntimePortfolio,
    card: portfolio,
    publishHeader: options.publishHeader,
  })

  return {
    portfolioState,
    portfolio,
    headerData,
    consoleState,
  }
}
