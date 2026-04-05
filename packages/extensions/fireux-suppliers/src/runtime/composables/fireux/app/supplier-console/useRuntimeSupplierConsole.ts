import { computed } from 'vue'
import { getDemoSupplierScenarios } from './demo-scenarios'
import { useRuntimeSupplier } from './useRuntimeSupplier'

/**
 * Root supplier console inputs.
 */
export function useRuntimeSupplierConsole() {
  const runtime = useRuntimeSupplier()
  const scenarios = computed(getDemoSupplierScenarios)

  return {
    runtime,
    scenarios,
  }
}
