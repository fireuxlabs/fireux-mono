import { computed } from 'vue'
import { getDemoProjectScenarios } from './demo-scenarios'
import { useRuntimeProject } from './useRuntimeProject'

/**
 * Root project console inputs.
 */
export function useRuntimeProjectConsole() {
  const runtime = useRuntimeProject()
  const scenarios = computed(getDemoProjectScenarios)

  return {
    runtime,
    scenarios,
  }
}
