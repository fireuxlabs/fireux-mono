import { useConsoleOverview } from 'fireux-core/runtime/composables/fireux/console/useConsoleOverview'
import {
  usePortfolioConsole,
  type PortfolioConsoleEntity,
} from './usePortfolioConsole'

const normalizeString = (value: unknown) => String(value ?? '').trim()

export function usePortfolioConsoleOverview() {
  const {
    livePortfolios,
    demoPortfolios,
    testPortfolio,
    selectedPortfolio,
    selectedMode,
  } = usePortfolioConsole()

  return useConsoleOverview<PortfolioConsoleEntity, PortfolioConsoleEntity>({
    selectedEntity: selectedPortfolio,
    selectedMode,
    liveItems: livePortfolios,
    demoItems: demoPortfolios,
    testItem: testPortfolio,
    getId: (portfolio) => normalizeString(portfolio?.id),
  })
}
