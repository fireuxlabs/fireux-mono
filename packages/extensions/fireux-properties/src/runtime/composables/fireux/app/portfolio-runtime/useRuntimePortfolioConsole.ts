import { computed } from 'vue'
import { getDemoPortfolioScenarios } from './demo-scenarios'
import { useRuntimePortfolio } from './useRuntimePortfolio'

/**
 * Root portfolio console inputs.
 */
export function useRuntimePortfolioConsole() {
  const runtime = useRuntimePortfolio()
  const scenarios = computed(getDemoPortfolioScenarios)

  return {
    runtime,
    scenarios,
  }
}
