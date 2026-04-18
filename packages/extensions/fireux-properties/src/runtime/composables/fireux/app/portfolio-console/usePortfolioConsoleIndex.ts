import { computed } from 'vue'
import { useConsoleIndex } from 'fireux-core/runtime/composables/fireux/console/useConsoleIndex'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { usePortfolioCollection } from '../../firestore/portfolio/fetch/usePortfolioCollection'
import { usePortfolioFetch } from '../../firestore/portfolio/fetch/usePortfolioFetch'
import { usePortfolioInterface } from '../../firestore/portfolio/utils/view/usePortfolioInterface'
import { usePortfolioConsole } from './usePortfolioConsole'

type DemoPortfolioListItem = {
  id: string
  name: string
  label?: string
  image_url?: string
}

const normalizeString = (value: unknown) => String(value ?? '').trim()

export function usePortfolioConsoleIndex() {
  const { portfolios: livePortfolios } = usePortfolioCollection()
  const { uid } = useAuth()
  const { portfolio: testPortfolio } = usePortfolioFetch(uid, {
    collectionPath: 'test-portfolios',
  })
  const { selectedPortfolio, selectedMode, selectPortfolio, clearSelectedPortfolio } =
    usePortfolioConsole()
  const { pill } = usePortfolioInterface()

  const portfolios = computed(() => ({
    live: livePortfolios.value,
    demo: [] as DemoPortfolioListItem[],
    test: testPortfolio.value,
  }))

  const consoleIndex = useConsoleIndex({
    entities: portfolios,
    selectedEntity: selectedPortfolio,
    selectedMode,
    selectEntity: selectPortfolio,
    toDemoCard: (portfolio: DemoPortfolioListItem) =>
      pill({
        id: portfolio.id,
        name: portfolio.name,
        region_label: portfolio.label,
      } as never),
    toSelectedCard: (portfolio, mode, user) => {
      if (mode === 'demo') {
        return pill({
          id: (portfolio as Record<string, unknown>).id,
          name: (portfolio as Record<string, unknown>).name,
          region_label: (portfolio as Record<string, unknown>).label,
        } as never)
      }

      if (mode === 'test') {
        const card = pill(portfolio as never)
        if (!card) return null

        return {
          ...card,
          imageUrl: user.avatarSrc || card.imageUrl,
          avatarUrl: user.avatarSrc || card.avatarUrl,
          title: 'Test Portfolio',
          subtitle: user.displayName,
        }
      }

      return pill(portfolio as never)
    },
    toTestCard: (portfolio, user) => {
      const card = pill(portfolio as never)
      if (!card) return null

      return {
        ...card,
        imageUrl: user.avatarSrc || card.imageUrl,
        avatarUrl: user.avatarSrc || card.avatarUrl,
        title: 'Test Portfolio',
        subtitle: user.displayName,
      }
    },
    getTestId: (portfolio) =>
      normalizeString((portfolio as Record<string, unknown>).id),
  })

  return {
    portfolios,
    selectedPortfolio,
    selectedMode,
    clearSelectedPortfolio,
    selectPortfolio,
    showSimulations: consoleIndex.showSimulations,
    livePortfolios: consoleIndex.liveItems,
    demoPortfolios: consoleIndex.demoItems,
    testPortfolio: consoleIndex.testItem,
    demoPortfolioCards: consoleIndex.demoCards,
    selectedPortfolioCard: consoleIndex.selectedCard,
    testPortfolioCard: consoleIndex.testCard,
    selectDemoPortfolio: consoleIndex.selectDemoEntity,
    selectTestPortfolio: consoleIndex.selectTestEntity,
  }
}
