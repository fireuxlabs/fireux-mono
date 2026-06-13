import { computed } from 'vue'
import { normalizeString } from 'fireux-core/runtime/utils/string'
import { useConsoleOverview } from 'fireux-core/runtime/composables/fireux/app/console/useConsoleOverview'
import {
  usePortfolioConsole,
  type PortfolioConsoleEntity,
} from '../core/usePortfolioConsole'

export function usePortfolioConsoleOverview() {
  const {
    portfolios,
    selection,
    runtime,
    actions,
  } = usePortfolioConsole()

  const overview = useConsoleOverview<PortfolioConsoleEntity>({
    selectedEntity: selection.portfolio,
    targetItems: portfolios.targets,
    getId: (portfolio) => normalizeString(portfolio?.id),
  })
  const debug = computed(() => ({
    portfolioId: selection.portfolioId.value,
    activePortfolioAppId: runtime.appId.value,
    rootCollection: runtime.rootCollection.value,
    readOnly: runtime.readOnly.value,
    canWrite: runtime.canWrite.value,
    focus: overview.focus.value,
    multiple: {
      count: overview.multiple.value.count,
      ids: overview.multiple.value.items.map((item) => normalizeString(item?.id)),
    },
  }))

  return {
    ...overview,
    selectedPortfolio: selection.portfolio,
    portfolioId: selection.portfolioId,
    activePortfolioAppId: runtime.appId,
    rootCollection: runtime.rootCollection,
    readOnly: runtime.readOnly,
    canWrite: runtime.canWrite,
    clearSelectedPortfolio: actions.clearSelectedPortfolio,
    debug,
  }
}
