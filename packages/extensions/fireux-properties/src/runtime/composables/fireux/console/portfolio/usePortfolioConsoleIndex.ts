import { computed, type Ref } from 'vue'
import { normalizeConsoleString as normalizeString } from 'fireux-core/runtime/composables/fireux/app/console/useConsole'
import { useConsoleIndex } from 'fireux-core/runtime/composables/fireux/app/console/useConsoleIndex'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import type { PortfolioCollectionFilter } from '../../firestore/portfolio/fetch/usePortfolioCollection'
import { usePortfolioFetch } from '../../firestore/portfolio/fetch/usePortfolioFetch'
import {
  usePortfolioConsole,
  type PortfolioConsoleEntity,
} from './usePortfolioConsole'

type UsePortfolioConsoleIndexOptions = {
  filter?:
    | PortfolioCollectionFilter
    | Ref<PortfolioCollectionFilter | null | undefined>
    | null
}

export function usePortfolioConsoleIndex(
  options: UsePortfolioConsoleIndexOptions = {}
) {
  const { uid } = useAuth()
  const normalizedUid = computed(() => normalizeString(uid.value))
  const { portfolio: testPortfolioSource } =
    usePortfolioFetch(normalizedUid, {
      collectionPath: 'test-portfolios',
    })
  const {
    livePortfolios,
    demoPortfolios,
    selectedPortfolio,
    selectedMode,
    portfolioId,
    activePortfolioAppId,
    rootCollection,
    canWrite,
    selectPortfolio,
    clearSelectedPortfolio,
  } = usePortfolioConsole({
    filter: options.filter,
  })

  const sourcePortfolios = computed(() => ({
    live: livePortfolios.value,
    demo: demoPortfolios.value,
    test: testPortfolioSource.value,
  }))

  const consoleIndex = useConsoleIndex<
    PortfolioConsoleEntity,
    PortfolioConsoleEntity,
    PortfolioConsoleEntity
  >({
    entities: sourcePortfolios,
    selectEntity: selectPortfolio,
    getTestId: (portfolio) => normalizeString(portfolio.id),
    debug: computed(() => ({
      selectedMode: selectedMode.value,
      portfolioId: portfolioId.value,
      activePortfolioAppId: activePortfolioAppId.value,
      rootCollection: rootCollection.value,
      canWrite: canWrite.value,
      selectedPortfolio: selectedPortfolio.value,
    })),
  })
  const debug = consoleIndex.debug

  return {
    portfolios: consoleIndex.entities,
    actions: consoleIndex.actions,
    selectedPortfolio,
    selectedMode,
    portfolioId,
    activePortfolioAppId,
    rootCollection,
    canWrite,
    debug,
    clearSelectedPortfolio,
  }
}
