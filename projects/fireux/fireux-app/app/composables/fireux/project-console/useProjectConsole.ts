import { computed } from 'vue'
import { useState } from '#imports'
import { getDemoProjects } from 'fireux-core/runtime/composables/fireux/app/utils/project-demo-scenarios/demo-scenarios/index'
import {
  usePublishConsoleHeader,
  type ConsoleHeaderData,
} from 'fireux-core/runtime/composables/fireux/console/useConsoleHeader'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { useProjectCollection } from 'fireux-core/runtime/composables/fireux/firestore/core/project/fetch/useProjectCollection'
import { useProjectFetch } from 'fireux-core/runtime/composables/fireux/firestore/core/project/fetch/useProjectFetch'
import type { ConsoleMode } from 'fireux-core/runtime/composables/fireux/console/useConsoleIndex'

type ProjectConsoleMode = ConsoleMode

type ProjectConsoleState = {
  selectedId: string
  selectedMode: ProjectConsoleMode
}

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
  const state = useState<ProjectConsoleState>('console:projects', () => ({
    selectedId: '',
    selectedMode: 'live',
  }))
  const selectedId = computed(() => normalizeString(state.value.selectedId))
  const selectedMode = computed(() => state.value.selectedMode)
  const demoProjects = computed<DemoProjectListItem[]>(() => getDemoProjects())

  const selectedProject = computed(() => {
    if (!selectedId.value) return null

    if (selectedMode.value === 'demo') {
      return demoProjects.value.find((project) => project.id === selectedId.value) ?? null
    }

    if (selectedMode.value === 'test') {
      const project = testProject.value
      return normalizeString(project?.id) === selectedId.value ? project : null
    }

    return (
      liveProjects.value.find((project) => normalizeString(project?.id) === selectedId.value) ??
      null
    )
  })

  const header = computed<ConsoleHeaderData>(() => {
    const project = selectedProject.value as Record<string, unknown> | null
    if (!project) return null

    if (selectedMode.value === 'demo') {
      return {
        title: normalizeString(project.name) || normalizeString(project.id),
        subtitle: normalizeString(project.label) || normalizeString(project.id) || undefined,
        imageUrl: normalizeString(project.image_url) || undefined,
      }
    }

    if (selectedMode.value === 'test') {
      return {
        title: 'Test Project',
        subtitle: normalizeString(project.name) || normalizeString(project.id) || undefined,
        imageUrl: normalizeString(project.image_url) || undefined,
      }
    }

    return {
      title: normalizeString(project.name) || normalizeString(project.id),
      subtitle:
        normalizeString(project.slug) || normalizeString(project.id) || undefined,
      imageUrl: normalizeString(project.image_url) || undefined,
    }
  })

  usePublishConsoleHeader('projects', header)

  const clearSelectedProject = () => {
    state.value = {
      selectedId: '',
      selectedMode: 'live',
    }
  }

  const selectProject = (projectId: string, mode: ProjectConsoleMode = 'live') => {
    state.value = {
      selectedId: normalizeString(projectId),
      selectedMode: mode,
    }
  }

  return {
    selectedProject,
    selectedMode,
    clearSelectedProject,
    selectProject,
  }
}
