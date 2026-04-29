import { computed } from 'vue'
import { normalizeConsoleString as normalizeString } from 'fireux-core/runtime/composables/fireux/console/useConsole'
import { useConsoleOverview } from 'fireux-core/runtime/composables/fireux/console/useConsoleOverview'
import {
  usePortfolioConsole,
  type PortfolioConsoleEntity,
} from './usePortfolioConsole'

export function usePortfolioConsoleOverview() {
  const {
    livePortfolios,
    demoPortfolios,
    testPortfolio,
    selectedPortfolio,
    selectedMode,
    portfolioId,
    rootCollection,
    canWrite,
    clearSelectedPortfolio,
  } = usePortfolioConsole()

  const overview = useConsoleOverview<PortfolioConsoleEntity, PortfolioConsoleEntity>({
    selectedEntity: selectedPortfolio,
    selectedMode,
    liveItems: livePortfolios,
    demoItems: demoPortfolios,
    testItem: testPortfolio,
    getId: (portfolio) => normalizeString(portfolio?.id),
  })
  const debug = computed(() => ({
    mode: selectedMode.value,
    portfolioId: portfolioId.value,
    rootCollection: rootCollection.value,
    canWrite: canWrite.value,
    focus: overview.focus.value,
    group: {
      count: overview.group.value.count,
      ids: overview.group.value.items.map((item) => normalizeString(item?.id)),
    },
  }))

  return {
    ...overview,
    selectedPortfolio,
    selectedMode,
    portfolioId,
    rootCollection,
    canWrite,
    clearSelectedPortfolio,
    debug,
  }
}
