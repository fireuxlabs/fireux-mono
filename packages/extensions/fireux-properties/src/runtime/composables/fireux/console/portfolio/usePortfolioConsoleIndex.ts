import { computed, type Ref } from 'vue'
import { normalizeConsoleString as normalizeString } from 'fireux-core/runtime/composables/fireux/app/console/useConsole'
import { useConsoleIndex } from 'fireux-core/runtime/composables/fireux/app/console/useConsoleIndex'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import type { PortfolioCollectionFilter } from '../../firestore/portfolio/fetch/usePortfolioCollection'
import { usePortfolioFetch } from '../../firestore/portfolio/fetch/usePortfolioFetch'
import { usePortfolioCreate } from '../../firestore/portfolio/mutations/usePortfolioCreate'
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
  const { portfolio: testPortfolioSource, pending: testPortfolioPending } =
    usePortfolioFetch(normalizedUid, {
      collectionPath: 'test-portfolios',
    })
  const { createTestPortfolio } = usePortfolioCreate()
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
    autoCreateTest: true,
    testPending: testPortfolioPending,
    testCreateKey: normalizedUid,
    createTestEntity: async ({ avatarSrc, displayName }) => {
      const testId = normalizedUid.value
      if (!testId) return null

      const userLabel =
        normalizeString(displayName) || `User ${testId.slice(0, 6)}`
      const result = await createTestPortfolio({
        id: testId,
        name: 'Test Portfolio',
        subtitle: userLabel,
        image_url: normalizeString(avatarSrc),
      })

      return normalizeString(result.id)
    },
  })
  const debug = computed(() => ({
    mode: selectedMode.value,
    portfolioId: portfolioId.value,
    activePortfolioAppId: activePortfolioAppId.value,
    rootCollection: rootCollection.value,
    canWrite: canWrite.value,
    selectedPortfolio: selectedPortfolio.value,
    counts: {
      live: consoleIndex.entities.value.live.length,
      demo: consoleIndex.entities.value.demo.length,
      test: consoleIndex.entities.value.test ? 1 : 0,
    },
  }))

  return {
    state: consoleIndex.state,
    user: consoleIndex.user,
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
