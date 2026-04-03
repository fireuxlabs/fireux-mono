import { computed } from 'vue'
import { getReadOnlyPortfolioScenarios } from './read-only-scenarios'
import { useRuntimePortfolio } from './useRuntimePortfolio'

/**
 * Root portfolio console inputs.
 */
export function useRuntimePortfolioConsole() {
  const runtime = useRuntimePortfolio()
  const scenarios = computed(getReadOnlyPortfolioScenarios)

  return {
    runtime,
    scenarios,
  }
}
