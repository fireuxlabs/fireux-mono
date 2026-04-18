import { computed } from 'vue'
import {
  useConsole,
  usePublishConsoleHeader,
  type ConsoleHeaderData,
} from 'fireux-core/runtime/composables/fireux/console/useConsole'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { usePortfolioCollection } from '../../firestore/portfolio/fetch/usePortfolioCollection'
import { usePortfolioFetch } from '../../firestore/portfolio/fetch/usePortfolioFetch'

type PortfolioConsoleMode = 'live' | 'demo' | 'test'

type DemoPortfolioListItem = {
  id: string
  name: string
  label?: string
  image_url?: string
  mode: 'demo'
}

const normalizeString = (value: unknown) => String(value ?? '').trim()

export function usePortfolioConsole() {
  const { portfolios: livePortfolios } = usePortfolioCollection()
  const { uid } = useAuth()
  const testPortfolioId = computed(() => normalizeString(uid.value))
  const demoPortfolios = computed<DemoPortfolioListItem[]>(() => [])
  const { portfolio: testPortfolio } = usePortfolioFetch(testPortfolioId, {
    collectionPath: 'test-portfolios',
  })
  const { selectedId, selectedMode, selectEntity, clearSelection } = useConsole('portfolios')

  const portfolios = computed(() => ({
    live: livePortfolios.value,
    demo: demoPortfolios.value,
    test: testPortfolio.value,
  }))

  const selectedPortfolio = computed(() => {
    const portfolioId = normalizeString(selectedId.value)
    if (!portfolioId) return null

    if (selectedMode.value === 'demo') {
      return demoPortfolios.value.find((portfolio) => portfolio.id === portfolioId) ?? null
    }

    if (selectedMode.value === 'test') {
      const portfolio = testPortfolio.value
      return normalizeString(portfolio?.id) === portfolioId ? portfolio : null
    }

    return (
      livePortfolios.value.find((portfolio) => normalizeString(portfolio?.id) === portfolioId) ??
      null
    )
  })

  const header = computed<ConsoleHeaderData>(() => {
    const portfolio = selectedPortfolio.value as Record<string, unknown> | null
    if (!portfolio) return null

    if (selectedMode.value === 'demo') {
      return {
        title: normalizeString(portfolio.name) || normalizeString(portfolio.id),
        subtitle: normalizeString(portfolio.label) || normalizeString(portfolio.id) || undefined,
        imageUrl: normalizeString(portfolio.image_url) || undefined,
      }
    }

    if (selectedMode.value === 'test') {
      return {
        title: 'Test Portfolio',
        subtitle:
          normalizeString(portfolio.name) ||
          normalizeString(portfolio.id) ||
          undefined,
        imageUrl: normalizeString(portfolio.image_url) || undefined,
      }
    }

    return {
      title: normalizeString(portfolio.name) || normalizeString(portfolio.id),
      subtitle:
        normalizeString(portfolio.region_label) ||
        normalizeString(portfolio.slug) ||
        normalizeString(portfolio.id) ||
        undefined,
      imageUrl: normalizeString(portfolio.image_url) || undefined,
    }
  })

  usePublishConsoleHeader('portfolios', header)

  const clearSelectedPortfolio = () => {
    clearSelection()
  }
  const selectPortfolio = (portfolioId: string, mode: PortfolioConsoleMode = 'live') => {
    selectEntity(portfolioId, mode)
  }

  return {
    portfolios,
    selectedPortfolio,
    selectedMode,
    clearSelectedPortfolio,
    selectPortfolio,
  }
}
