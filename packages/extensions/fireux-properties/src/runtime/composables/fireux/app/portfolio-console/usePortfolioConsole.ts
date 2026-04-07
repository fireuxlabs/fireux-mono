import { computed } from 'vue'
import { useConsoleState } from 'fireux-core/runtime/composables/fireux/console/useConsoleState'
import type { Portfolio } from '../../../../models/portfolio.model'
import { usePortfolioSelection } from './usePortfolioSelection'
import { useActivePortfolio } from './useActivePortfolio'
import { usePortfolioInterface } from '../../firestore/portfolio/utils/view/usePortfolioInterface'

type UsePortfolioConsoleOptions = {
  publishHeader?: boolean
}

const normalizeString = (value: unknown): string => String(value || '').trim()

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
    toPortfolioCard(portfolioState.portfolio.value as Portfolio | null)
  )

  const headerData = computed(() =>
    portfolio.value
      ? {
          imageUrl: portfolio.value.avatarUrl,
          title: portfolio.value.title,
          subtitle:
            normalizeString(portfolio.value.subtitle) ||
            normalizeString(portfolioState.portfolio.value?.id),
        }
      : null
  )

  const consoleState = useConsoleState({
    family: 'portfolio',
    selectedId: portfolioState.id,
    mode: computed(() => 'live'),
    setMode: () => {},
    clearSelection: portfolioSelection.clearRuntimePortfolio,
    header: headerData,
    publishHeader: options.publishHeader,
    modeOptions: [{ value: 'live', label: 'Real' }],
  })

  return {
    portfolioState,
    portfolio,
    headerData,
    consoleState,
  }
}
