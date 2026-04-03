import { computed } from 'vue'
import { getReadOnlyPortfolioScenarios } from './read-only-scenarios'
import { useRuntimePortfolio } from './useRuntimePortfolio'
import { useRuntimePortfolioSelection } from './state'

/**
 * Demo-only portfolio console.
 */
export function useRuntimePortfolioConsole() {
  const runtime = useRuntimePortfolio()
  const { setRuntimePortfolio } = useRuntimePortfolioSelection()
  const scenarios = computed(getReadOnlyPortfolioScenarios)

  const setActivePortfolio = (portfolioId: string) => {
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
    setActivePortfolio,
  }
}
