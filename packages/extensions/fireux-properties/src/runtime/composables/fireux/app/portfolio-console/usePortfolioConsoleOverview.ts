import { useConsoleOverview } from 'fireux-core/runtime/composables/fireux/console/useConsoleOverview'
import type { Portfolio } from '../../../../../models/portfolio.model'
import { usePortfolioConsole } from './usePortfolioConsole'

const normalizeString = (value: unknown) => String(value ?? '').trim()

export function usePortfolioConsoleOverview() {
  const { livePortfolios, demoPortfolios, testPortfolio, selectedPortfolio, selectedMode } =
    usePortfolioConsole()

  return useConsoleOverview<Portfolio, Portfolio>({
    selectedEntity: selectedPortfolio,
    selectedMode,
    liveItems: livePortfolios,
    demoItems: demoPortfolios,
    testItem: testPortfolio,
    getId: (portfolio) => normalizeString(portfolio?.id),
  })
}
