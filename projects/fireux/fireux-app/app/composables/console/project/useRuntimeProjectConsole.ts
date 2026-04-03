import { computed } from 'vue'
import { getReadOnlyProjectScenarios } from './read-only-scenarios'
import { useRuntimeProject } from './useRuntimeProject'

/**
 * Root project console inputs.
 */
export function useRuntimeProjectConsole() {
  const runtime = useRuntimeProject()
  const scenarios = computed(getReadOnlyProjectScenarios)

  return {
    runtime,
    scenarios,
  }
}
