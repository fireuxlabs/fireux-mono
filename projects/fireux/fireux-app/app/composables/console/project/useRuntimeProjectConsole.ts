import { computed } from 'vue'
import { getReadOnlyProjectScenarios } from './read-only-scenarios'
import { useRuntimeProjectSelection } from './state'
import { useRuntimeProject } from './useRuntimeProject'

/**
 * Demo-only project console.
 */
export function useRuntimeProjectConsole() {
  const runtime = useRuntimeProject()
  const { setRuntimeProject } = useRuntimeProjectSelection()
  const scenarios = computed(getReadOnlyProjectScenarios)

  const setActiveProject = (projectId: string) => {
    const resolvedId = String(projectId || '').trim()
    if (!resolvedId) return
    setRuntimeProject({
      projectId: resolvedId,
      mode: 'read-only',
    })
  }

  return {
    runtime,
    scenarios,
    setActiveProject,
  }
}
