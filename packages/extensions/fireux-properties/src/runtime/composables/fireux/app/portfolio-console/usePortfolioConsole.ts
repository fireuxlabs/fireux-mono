import { computed } from 'vue'
import { normalizeString } from 'fireux-core/runtime/composables/fireux/console/console.normalize'
import { useConsoleState } from 'fireux-core/runtime/composables/fireux/console/useConsoleState'
import type { Portfolio } from '../../../../models/portfolio.model'
import { usePortfolioSelection } from './usePortfolioSelection'
import { useActivePortfolio } from './useActivePortfolio'
import { usePortfolioInterface } from '../../firestore/portfolio/utils/view/usePortfolioInterface'

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

  const headerData = computed(() => {
    const card = portfolio.value
    if (!card) return null

    return {
      imageUrl: normalizeString(card.imageUrl ?? card.avatarUrl) || undefined,
      title: card.title,
      subtitle:
        normalizeString(card.subtitle) || normalizeString(portfolioState.id.value) || undefined,
    }
  })
  const consoleState = useConsoleState({
    family: 'portfolios',
    selectedId: portfolioState.id,
    mode: portfolioState.mode,
    setMode: (mode) => portfolioSelection.setRuntimePortfolio({ mode }),
    clearSelection: portfolioSelection.clearRuntimePortfolio,
    header: headerData,
    publishHeader: options.publishHeader,
  })

  return {
    portfolioState,
    portfolio,
    headerData,
    consoleState,
  }
}
