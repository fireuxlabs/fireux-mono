import { computed } from 'vue'
import { usePortfolioCollection } from '../../firestore/portfolio/fetch/usePortfolioCollection'
import { getDemoPortfolios } from './demo-scenarios'
import { usePortfolioConsole } from './usePortfolioConsole'
import { usePortfolioSelection } from './usePortfolioSelection'

type UsePortfolioConsoleIndexOptions = {
  publishHeader?: boolean
}

export function usePortfolioConsoleIndex(
  options: UsePortfolioConsoleIndexOptions = {}
) {
  const { portfolio, consoleState } = usePortfolioConsole({
    publishHeader: options.publishHeader,
  })
  const { setRuntimePortfolio } = usePortfolioSelection()
  const { portfolios } = usePortfolioCollection()

  const livePortfolios = computed(() => portfolios.value ?? [])
  const demoPortfolios = computed(() => getDemoPortfolios())

  const selectPortfolio = (portfolioId: string) => {
    setRuntimePortfolio({ portfolioId, mode: 'live' })
  }

  const selectDemoPortfolio = (portfolioId: string) => {
    setRuntimePortfolio({ portfolioId, mode: 'demo' })
  }

  return {
    portfolio,
    livePortfolios,
    demoPortfolios,
    clearSelection: consoleState.clearSelection,
    selectPortfolio,
    selectDemoPortfolio,
  }
}
