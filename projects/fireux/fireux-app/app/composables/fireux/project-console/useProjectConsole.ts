import { computed } from 'vue'
import { getDemoProjects } from 'fireux-core/runtime/composables/fireux/app/utils/project-demo-scenarios/demo-scenarios/index'
import {
  useConsole,
  type ConsoleMode,
} from 'fireux-core/runtime/composables/fireux/console/useConsole'
import {
  usePublishConsoleHeader,
  type ConsoleHeaderData,
} from 'fireux-core/runtime/composables/fireux/console/useConsoleHeader'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { useProjectCollection } from 'fireux-core/runtime/composables/fireux/firestore/core/project/fetch/useProjectCollection'
import { useProjectFetch } from 'fireux-core/runtime/composables/fireux/firestore/core/project/fetch/useProjectFetch'

type ProjectConsoleMode = ConsoleMode

const normalizeString = (value: unknown) => String(value ?? '').trim()

export function useProjectConsole() {
  const { projects: liveProjects } = useProjectCollection({ scope: 'mine' })
  const { uid } = useAuth()
  const { project: testProject } = useProjectFetch(uid, { source: 'test' })
  const { selectedId, selectedMode, selectEntity, clearSelection } = useConsole('projects')
  const demoProjects = computed(() => getDemoProjects())

  const selectedProject = computed(() => {
    const projectId = normalizeString(selectedId.value)
    if (!projectId) return null

    if (selectedMode.value === 'demo') {
      return (
        demoProjects.value.find((project) => normalizeString(project.id) === projectId) ?? null
      )
    }

    if (selectedMode.value === 'test') {
      const project = testProject.value
      return normalizeString(project?.id) === projectId ? project : null
    }

    return (
      liveProjects.value.find((project) => normalizeString(project?.id) === projectId) ?? null
    )
  })

  const header = computed<ConsoleHeaderData>(() => {
    const project = selectedProject.value as Record<string, unknown> | null
    if (!project) return null

    if (selectedMode.value === 'demo') {
      return {
        title: normalizeString(project.name),
        subtitle: normalizeString(project.label) || undefined,
        imageUrl: normalizeString(project.image_url) || undefined,
      }
    }

    if (selectedMode.value === 'test') {
      return {
        title: 'Test Project',
        subtitle: normalizeString(project.name) || undefined,
        imageUrl: normalizeString(project.image_url) || undefined,
      }
    }

    return {
      title: normalizeString(project.name),
      subtitle: normalizeString(project.slug) || undefined,
      imageUrl: normalizeString(project.image_url) || undefined,
    }
  })

  usePublishConsoleHeader('projects', header)

  const clearSelectedProject = () => {
    clearSelection()
  }

  const selectProject = (projectId: string, mode: ProjectConsoleMode = 'live') => {
    selectEntity(projectId, mode)
  }

  return {
    selectedProject,
    selectedMode,
    clearSelectedProject,
    selectProject,
  }
}
