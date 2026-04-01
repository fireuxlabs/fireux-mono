import { computed } from 'vue'
import { useProjectInterface } from 'fireux-core/runtime/composables/fireux/firestore/system/project/utils/view/useProjectInterface'
import type { Project } from 'fireux-core/runtime/models/system/project.model'
import { getReadOnlyProjectScenarios } from './read-only-scenarios'
import { useRuntimeProjectSelection } from './state'
import { useRuntimeProject } from './useRuntimeProject'

const normalizeString = (value: unknown): string => String(value || '').trim()

/**
 * Demo-only project console.
 */
export function useRuntimeProjectConsole() {
  const runtime = useRuntimeProject()
  const { setRuntimeProject } = useRuntimeProjectSelection()
  const { interface: projectInterface } = useProjectInterface()
  const scenarios = computed(() => getReadOnlyProjectScenarios())

  const scenarioPills = computed(() =>
    scenarios.value
      .map((entry) =>
        projectInterface({
          ...(entry.project ?? {}),
          id: entry.id,
        } as Project)
      )
      .filter((entry): entry is NonNullable<ReturnType<typeof projectInterface>> => Boolean(entry))
  )

  const activeProject = computed<Project | null>(() => {
    const currentId = normalizeString(runtime.id.value)
    if (!currentId) return null

    const scenario = scenarios.value.find((entry) => normalizeString(entry.id) === currentId)
    return scenario?.project ?? null
  })

  const activeProjectPill = computed(() =>
    activeProject.value ? projectInterface(activeProject.value as Project) : null
  )
  const hasActiveProject = computed(() => activeProject.value !== null)
  const showSelector = computed(() => scenarios.value.length > 1)

  const setActiveScenario = (projectId: string) => {
    const resolvedId = normalizeString(projectId)
    if (!resolvedId) return
    setRuntimeProject({
      projectId: resolvedId,
      mode: 'read-only',
    })
  }

  return {
    runtime,
    scenarios,
    scenarioPills,
    activeProject,
    activeProjectPill,
    hasActiveProject,
    showSelector,
    pending: computed(() => false),
    setActiveScenario,
  }
}
