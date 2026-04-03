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
  const scenarios = computed(getReadOnlyProjectScenarios)

  const toProjectPill = (
    project: Partial<Project> | null | undefined,
    options: { id?: string; imageUrl?: unknown } = {}
  ) => {
    const pill = projectInterface({
      ...(project ?? {}),
      ...(options.id ? { id: options.id } : {}),
    } as Project)

    if (!pill) return null

    const imageUrl = normalizeString(options.imageUrl)
    return imageUrl && !pill.imageUrl ? { ...pill, imageUrl } : pill
  }

  const scenarioPills = computed(() =>
    scenarios.value
      .map((entry) =>
        toProjectPill(entry.project, {
          id: entry.id,
          imageUrl: (entry as any).image_url,
        })
      )
      .filter((entry): entry is NonNullable<ReturnType<typeof projectInterface>> => Boolean(entry))
  )

  const activeProjectPill = computed(() => toProjectPill(runtime.project.value))
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
    activeProjectPill,
    showSelector,
    setActiveScenario,
  }
}
