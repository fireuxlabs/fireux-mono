import { computed, type Ref } from 'vue'
import { useConsoleIndex } from 'fireux-core/runtime/composables/fireux/console/useConsoleIndex'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import type { PortfolioCollectionFilter } from '../../firestore/portfolio/fetch/usePortfolioCollection'
import { usePortfolioFetch } from '../../firestore/portfolio/fetch/usePortfolioFetch'
import { usePortfolioCreate } from '../../firestore/portfolio/mutations/usePortfolioCreate'
import type { Portfolio } from '../../../../../models/portfolio.model'
import { usePortfolioConsole } from './usePortfolioConsole'

const normalizeString = (value: unknown) => String(value ?? '').trim()

type UsePortfolioConsoleIndexOptions = {
  filter?: PortfolioCollectionFilter | Ref<PortfolioCollectionFilter | null | undefined> | null
}

export function usePortfolioConsoleIndex(
  options: UsePortfolioConsoleIndexOptions = {}
) {
  const { uid } = useAuth()
  const { portfolio: testPortfolioSource, pending: testPortfolioPending } = usePortfolioFetch(uid, {
    collectionPath: 'test-portfolios',
  })
  const { createTestPortfolio } = usePortfolioCreate()
  const {
    livePortfolios,
    demoPortfolios,
    selectedPortfolio,
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

  const consoleIndex = useConsoleIndex<Portfolio, Portfolio, Portfolio>({
    entities: sourcePortfolios,
    selectEntity: selectPortfolio,
    getTestId: (portfolio) => normalizeString(portfolio.id),
    autoCreateTest: true,
    testPending: testPortfolioPending,
    testCreateKey: uid,
    createTestEntity: async ({ avatarSrc, displayName }) => {
      const testId = normalizeString(uid.value)
      if (!testId) return null

      const userLabel = normalizeString(displayName) || `User ${testId.slice(0, 6)}`
      const result = await createTestPortfolio({
        id: testId,
        name: 'Test Portfolio',
        subtitle: userLabel,
        image_url: normalizeString(avatarSrc),
      })

      return normalizeString(result.id)
    },
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
