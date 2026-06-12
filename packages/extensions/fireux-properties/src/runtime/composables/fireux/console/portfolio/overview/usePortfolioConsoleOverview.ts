import { computed } from 'vue'
import { normalizeConsoleString as normalizeString } from 'fireux-core/runtime/composables/fireux/app/console/useConsole'
import { useConsoleOverview } from 'fireux-core/runtime/composables/fireux/app/console/useConsoleOverview'
import {
  usePortfolioConsole,
  type PortfolioConsoleEntity,
} from '../core/usePortfolioConsole'

export function usePortfolioConsoleOverview() {
  const {
    targetPortfolios,
    selectedPortfolio,
    portfolioId,
    activePortfolioAppId,
    rootCollection,
    canWrite,
    clearSelectedPortfolio,
  } = usePortfolioConsole()

  const overview = useConsoleOverview<PortfolioConsoleEntity>({
    selectedEntity: selectedPortfolio,
    targetItems: targetPortfolios,
    getId: (portfolio) => normalizeString(portfolio?.id),
  })
  const debug = computed(() => ({
    portfolioId: portfolioId.value,
    activePortfolioAppId: activePortfolioAppId.value,
    rootCollection: rootCollection.value,
    canWrite: canWrite.value,
    focus: overview.focus.value,
    multiple: {
      count: overview.multiple.value.count,
      ids: overview.multiple.value.items.map((item) => normalizeString(item?.id)),
    },
  }))

  return {
    ...overview,
    selectedPortfolio,
    portfolioId,
    activePortfolioAppId,
    rootCollection,
    canWrite,
    clearSelectedPortfolio,
    debug,
  }
}
