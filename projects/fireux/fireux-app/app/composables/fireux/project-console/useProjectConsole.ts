import { computed } from 'vue'
import { getDemoProjects } from 'fireux-core/runtime/composables/fireux/app/utils/project-demo-scenarios/demo-scenarios/index'
import { useConsole } from 'fireux-core/runtime/composables/fireux/console/useConsole'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { useProjectCollection } from 'fireux-core/runtime/composables/fireux/firestore/core/project/fetch/useProjectCollection'
import { useProjectFetch } from 'fireux-core/runtime/composables/fireux/firestore/core/project/fetch/useProjectFetch'

type ProjectConsoleMode = 'live' | 'demo' | 'test'

type DemoProjectListItem = {
  id: string
  name: string
  label: string
  image_url?: string
  mode: 'demo'
}

const normalizeString = (value: unknown) => String(value ?? '').trim()

export function useProjectConsole() {
  const { projects: liveProjects } = useProjectCollection({ scope: 'mine' })
  const { uid } = useAuth()
  const { project: testProject } = useProjectFetch(uid, { source: 'test' })
  const { selectedId, selectedMode, selectEntity, clearSelection } = useConsole('projects')

  const projects = computed(() => ({
    live: liveProjects.value,
    demo: getDemoProjects(),
    test: testProject.value,
  }))
  const selectedProject = computed(() => {
    const projectId = normalizeString(selectedId.value)
    if (!projectId) return null

    if (selectedMode.value === 'demo') {
      return (getDemoProjects() as DemoProjectListItem[]).find((project) => project.id === projectId) ?? null
    }

    if (selectedMode.value === 'test') {
      const project = testProject.value
      return normalizeString(project?.id) === projectId ? project : null
    }

    return (
      liveProjects.value.find((project) => normalizeString(project?.id) === projectId) ?? null
    )
  })
  const selectedProjectCard = computed(() => null)

  const clearSelectedProject = () => {
    clearSelection()
  }
  const selectProject = (
    projectId: string,
    mode: ProjectConsoleMode = 'live'
  ) => {
    selectEntity(projectId, mode)
  }

  return {
    projects,
    selectedProject,
    selectedProjectCard,
    selectedMode,
    clearSelectedProject,
    selectProject,
  }
}
