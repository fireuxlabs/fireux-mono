import { computed } from 'vue'
import { usePortfolioInterface } from '../../firestore/portfolio/utils/view/usePortfolioInterface'
import { getReadOnlyPortfolioScenarios } from './read-only-scenarios'
import { useRuntimePortfolio } from './useRuntimePortfolio'
import { useRuntimePortfolioSelection } from './state'
import type { Portfolio } from '../../../models/portfolio.model'

/**
 * Demo-only portfolio console.
 */
export function useRuntimePortfolioConsole() {
  const runtime = useRuntimePortfolio()
  const { setRuntimePortfolio } = useRuntimePortfolioSelection()
  const { pill } = usePortfolioInterface()
  const scenarios = computed(() => getReadOnlyPortfolioScenarios())
  const scenarioPills = computed(() =>
    scenarios.value
      .map((entry) =>
        pill({
          ...entry.portfolio,
          id: entry.id,
        } as Portfolio)
      )
      .filter((entry): entry is NonNullable<ReturnType<typeof pill>> => Boolean(entry))
  )

  const activePortfolio = computed<Portfolio | null>(() => {
    const currentId = String(runtime.id.value || '').trim()
    if (!currentId) return null

    const scenario = scenarios.value.find((entry) => String(entry.id || '').trim() === currentId)
    return scenario?.portfolio ?? null
  })
  const activePortfolioPill = computed(() =>
    activePortfolio.value ? pill(activePortfolio.value) : null
  )
  const hasActivePortfolio = computed(() => activePortfolio.value !== null)
  const showSelector = computed(() => scenarios.value.length > 1)

  const setActiveScenario = (portfolioId: string) => {
    const resolvedId = String(portfolioId || '').trim()
    if (!resolvedId) return
    setRuntimePortfolio({
      portfolioId: resolvedId,
      mode: 'read-only',
    })
  }

  return {
    runtime,
    scenarios,
    scenarioPills,
    activePortfolio,
    activePortfolioPill,
    hasActivePortfolio,
    showSelector,
    pending: computed(() => false),
    setActiveScenario,
  }
}
