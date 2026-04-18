import { computed } from 'vue'
import { useState } from '#imports'
import {
  usePublishConsoleHeader,
  type ConsoleHeaderData,
} from 'fireux-core/runtime/composables/fireux/console/useConsoleHeader'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import type { ConsoleMode } from 'fireux-core/runtime/composables/fireux/console/useConsoleIndex'
import { usePortfolioCollection } from '../../firestore/portfolio/fetch/usePortfolioCollection'
import { usePortfolioFetch } from '../../firestore/portfolio/fetch/usePortfolioFetch'

type PortfolioConsoleMode = ConsoleMode

type PortfolioConsoleState = {
  selectedId: string
  selectedMode: PortfolioConsoleMode
}

const normalizeString = (value: unknown) => String(value ?? '').trim()

export function usePortfolioConsole() {
  const { portfolios: livePortfolios } = usePortfolioCollection()
  const { uid } = useAuth()
  const { portfolio: testPortfolio } = usePortfolioFetch(uid, {
    collectionPath: 'test-portfolios',
  })
  const state = useState<PortfolioConsoleState>('console:portfolios', () => ({
    selectedId: '',
    selectedMode: 'live',
  }))
  const selectedId = computed(() => normalizeString(state.value.selectedId))
  const selectedMode = computed(() => state.value.selectedMode)

  const selectedPortfolio = computed(() => {
    if (!selectedId.value) return null

    if (selectedMode.value === 'test') {
      const portfolio = testPortfolio.value
      return normalizeString(portfolio?.id) === selectedId.value ? portfolio : null
    }

    return (
      livePortfolios.value.find((portfolio) => normalizeString(portfolio?.id) === selectedId.value) ??
      null
    )
  })

  const header = computed<ConsoleHeaderData>(() => {
    const portfolio = selectedPortfolio.value as Record<string, unknown> | null
    if (!portfolio) return null

    if (selectedMode.value === 'test') {
      return {
        title: 'Test Portfolio',
        subtitle: normalizeString(portfolio.name) || normalizeString(portfolio.id) || undefined,
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
    state.value = {
      selectedId: '',
      selectedMode: 'live',
    }
  }

  const selectPortfolio = (portfolioId: string, mode: PortfolioConsoleMode = 'live') => {
    state.value = {
      selectedId: normalizeString(portfolioId),
      selectedMode: mode,
    }
  }

  return {
    selectedPortfolio,
    selectedMode,
    clearSelectedPortfolio,
    selectPortfolio,
  }
}
