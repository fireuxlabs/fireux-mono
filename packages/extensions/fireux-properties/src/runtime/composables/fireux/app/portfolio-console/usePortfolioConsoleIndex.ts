import { computed } from 'vue'
import { useConsoleIndex } from 'fireux-core/runtime/composables/fireux/console/useConsoleIndex'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { usePortfolioFetch } from '../../firestore/portfolio/fetch/usePortfolioFetch'
import type { Portfolio } from '../../../../../models/portfolio.model'
import { usePortfolioConsole } from './usePortfolioConsole'

const normalizeString = (value: unknown) => String(value ?? '').trim()

export function usePortfolioConsoleIndex() {
  const { uid } = useAuth()
  const { portfolio: testPortfolioSource, pending: testPortfolioPending } = usePortfolioFetch(uid, {
    collectionPath: 'test-portfolios',
  })
  const {
    livePortfolios,
    demoPortfolios,
    selectedPortfolio,
    selectPortfolio,
    clearSelectedPortfolio,
  } = usePortfolioConsole()

  const sourcePortfolios = computed(() => ({
    live: livePortfolios.value,
    demo: demoPortfolios.value,
    test: testPortfolioSource.value,
  }))

  const consoleIndex = useConsoleIndex<Portfolio, Portfolio, Portfolio>({
    entities: sourcePortfolios,
    selectEntity: selectPortfolio,
    getTestId: (portfolio) => normalizeString(portfolio.id),
    testPending: testPortfolioPending,
  })

  return {
    state: consoleIndex.state,
    user: consoleIndex.user,
    portfolios: consoleIndex.entities,
    actions: consoleIndex.actions,
    selectedPortfolio,
    clearSelectedPortfolio,
  }
}
