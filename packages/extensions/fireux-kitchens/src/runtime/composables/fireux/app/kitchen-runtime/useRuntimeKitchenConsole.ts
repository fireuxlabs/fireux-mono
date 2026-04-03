import { computed } from 'vue'
import { getReadOnlyKitchenScenarios } from './read-only-scenarios'
import { useRuntimeKitchen } from './useRuntimeKitchen'

/**
 * Root kitchen console inputs.
 */
export function useRuntimeKitchenConsole() {
  const runtime = useRuntimeKitchen()
  const scenarios = computed(getReadOnlyKitchenScenarios)

  return {
    runtime,
    scenarios,
  }
}
