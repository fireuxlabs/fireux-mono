import { computed } from 'vue'
import { getReadOnlySupplierScenarios } from './read-only-scenarios'
import { useRuntimeSupplier } from './useRuntimeSupplier'

/**
 * Root supplier console inputs.
 */
export function useRuntimeSupplierConsole() {
  const runtime = useRuntimeSupplier()
  const scenarios = computed(getReadOnlySupplierScenarios)

  return {
    runtime,
    scenarios,
  }
}
