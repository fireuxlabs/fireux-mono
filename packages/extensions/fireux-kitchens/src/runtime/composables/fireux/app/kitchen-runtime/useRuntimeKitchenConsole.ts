import { computed } from 'vue'
import { getDemoKitchenScenarios } from './demo-scenarios'
import { useRuntimeKitchen } from './useRuntimeKitchen'

/**
 * Root kitchen console inputs.
 */
export function useRuntimeKitchenConsole() {
  const runtime = useRuntimeKitchen()
  const scenarios = computed(getDemoKitchenScenarios)

  return {
    runtime,
    scenarios,
  }
}
