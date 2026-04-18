import { computed } from 'vue'
import { toConsoleSelectionStateKey } from 'fireux-core/runtime/composables/fireux/app/routing/consoleRoutes'
import { getDemoProjects } from 'fireux-core/runtime/composables/fireux/app/utils/project-demo-scenarios/demo-scenarios/index'
import { normalizeConsoleMode, normalizeString } from 'fireux-core/runtime/composables/fireux/console/console.normalize'
import { useConsoleEntityAdapter } from 'fireux-core/runtime/composables/fireux/console/useConsoleEntityAdapter'
import { selectionKey, useConsoleSelection } from 'fireux-core/runtime/composables/fireux/console/useConsoleSelection'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { useProjectCollection } from 'fireux-core/runtime/composables/fireux/firestore/core/project/fetch/useProjectCollection'
import { useProjectFetch } from 'fireux-core/runtime/composables/fireux/firestore/core/project/fetch/useProjectFetch'
import {
  useProjectInterface,
  type ProjectSurface,
} from 'fireux-core/runtime/composables/fireux/firestore/core/project/utils/view/useProjectInterface'
import { useUser } from 'fireux-core/runtime/composables/fireux/firestore/core/user/useUser'

type ProjectConsoleMode = 'live' | 'demo' | 'test'

type UseProjectConsoleOptions = {
  publishHeader?: boolean
}

type DemoProjectListItem = {
  id: string
  name: string
  label: string
  image_url?: string
  mode: 'demo'
}

type ProjectConsoleSelectionState = {
  selectedId: string
  mode: ProjectConsoleMode
}

const COOKIE_KEY = toConsoleSelectionStateKey('projects')

const normalizeSelectionState = (value: unknown): ProjectConsoleSelectionState => {
  const source = value && typeof value === 'object' ? (value as Record<string, unknown>) : {}

  return {
    selectedId: normalizeString(source.selectedId ?? source.projectId),
    mode: normalizeConsoleMode(source.mode, { defaultMode: 'live' }),
  }
}

export function useProjectConsole(options: UseProjectConsoleOptions = {}) {
  const { projects: liveProjects } = useProjectCollection({ scope: 'mine' })
  const { uid } = useAuth()
  const { currentUser, avatarSrc } = useUser()
  const { project: testProject } = useProjectFetch(uid, { source: 'test' })
  const { pill } = useProjectInterface()
  const selection = useConsoleSelection<ProjectConsoleSelectionState>({
    cookieKey: COOKIE_KEY,
    defaultState: () => ({ selectedId: '', mode: 'live' }),
    normalizeState: normalizeSelectionState,
  })
  const selectedProjectId = selectionKey(selection, 'selectedId')
  const selectedMode = selectionKey(selection, 'mode')
  const demoProjects = computed<DemoProjectListItem[]>(() => getDemoProjects())

  const projects = computed(() => ({
    live: liveProjects.value,
    demo: demoProjects.value,
    test: testProject.value,
  }))

  const testProjectCardInput = computed<ProjectSurface | null>(() => {
    const project = testProject.value
    if (!project) return null

    return {
      ...project,
      image_url: normalizeString(project.image_url) || normalizeString(avatarSrc.value),
    }
  })

  const selectedProject = computed<ProjectSurface | DemoProjectListItem | null>(() => {
    const projectId = normalizeString(selectedProjectId.value)
    if (!projectId) return null

    if (selectedMode.value === 'demo') {
      return demoProjects.value.find((project) => project.id === projectId) ?? null
    }

    if (selectedMode.value === 'test') {
      const project = testProjectCardInput.value
      return project?.id === projectId ? project : null
    }

    return (
      liveProjects.value.find((project) => normalizeString(project?.id) === projectId) ?? null
    )
  })

  const selectedProjectCard = computed(() => {
    const project = selectedProject.value
    if (!project) return null

    if (selectedMode.value === 'demo') {
      return pill({
        id: project.id,
        slug: project.id,
        name: project.name,
        description: project.label,
        image_url: project.image_url,
        project_type: 'demo',
        status: 'active',
      })
    }

    if (selectedMode.value === 'test') {
      const card = pill(project as ProjectSurface)
      if (!card) return null

      return {
        ...card,
        title: 'Test Project',
        subtitle: normalizeString(currentUser.value?.display_name),
      }
    }

    return pill(project as ProjectSurface)
  })

  const selectProject = (projectId: string, mode: ProjectConsoleMode = 'live') => {
    selection.set({
      selectedId: normalizeString(projectId),
      mode: normalizeConsoleMode(mode, { defaultMode: selectedMode.value }),
    })
  }

  const clearProjectSelection = () => {
    selection.clear()
  }

  useConsoleEntityAdapter({
    family: 'projects',
    selectedId: selectedProjectId,
    mode: selectedMode,
    setMode: (mode) =>
      selection.set({
        mode: normalizeConsoleMode(mode, { defaultMode: selectedMode.value }),
      }),
    clearSelection: clearProjectSelection,
    card: selectedProjectCard,
    publishHeader: options.publishHeader === true,
  })

  return {
    projects,
    selectedProject,
    selectedProjectCard,
    selectedMode,
    clearSelectedProject: clearProjectSelection,
    selectProject,
  }
}
