import { computed } from 'vue'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { useRuntimeConsole } from 'fireux-core/runtime/composables/fireux/runtime/useRuntimeConsole'
import {
  useProjectInterface,
  type ProjectInterfaceInput,
} from 'fireux-core/runtime/composables/fireux/firestore/system/project/utils/view/useProjectInterface'
import { useProjectCollection } from 'fireux-core/runtime/composables/fireux/firestore/system/project/fetch/useProjectCollection'
import type { Project } from 'fireux-core/runtime/models/system/project.model'
import { useRuntimeProjectSelection } from './state'
import { getDemoProjectScenarios } from './demo-scenarios'
import { useRuntimeProject } from './useRuntimeProject'

type UseRuntimeProjectConsoleOptions = {
  publishHeader?: boolean
}

const normalizeString = (value: unknown): string => String(value || '').trim()
const stripTestProjectSuffix = (value: unknown): string =>
  normalizeString(value)
    .replace(/\s+test project$/i, '')
    .trim()

/**
 * Root project console inputs.
 */
export function useRuntimeProjectConsole(
  options: UseRuntimeProjectConsoleOptions = {}
) {
  const runtime = useRuntimeProject()
  const projectSelection = useRuntimeProjectSelection()
  const { currentUser: authUser, uid } = useAuth()
  const { projects: liveProjects } = useProjectCollection('projects')
  const { projects: testProjects } = useProjectCollection('test-projects')
  const { interface: toProjectCard } = useProjectInterface()
  const scenarios = computed(getDemoProjectScenarios)
  const selectedMode = projectSelection.mode

  type ProjectPill = NonNullable<ReturnType<typeof toProjectCard>>

  const buildProjectPill = (
    target?: Project | null,
    imageUrl?: unknown,
    id?: unknown
  ): ProjectPill | null => {
    const pill = toProjectCard({
      ...(target ?? {}),
      id: normalizeString(id) || normalizeString(target?.id),
    } as Project)

    if (!pill) return null

    return {
      ...pill,
      imageUrl: normalizeString(imageUrl) || pill.imageUrl,
      title:
        selectedMode.value === 'test'
          ? normalizeString(authUser.value?.displayName) ||
            stripTestProjectSuffix(target?.name) ||
            'Your'
          : pill.title,
      subtitle: selectedMode.value === 'test' ? 'Test Project' : pill.subtitle,
    }
  }

  const demoProjects = computed<ProjectInterfaceInput[]>(() =>
    scenarios.value.map((entry) => ({
      ...(entry.project ?? {}),
      id: entry.id,
      image_url: entry.image_url,
    }))
  )

  const availableProjects = computed<ProjectInterfaceInput[]>(() => {
    if (selectedMode.value === 'live') {
      return liveProjects.value as ProjectInterfaceInput[]
    }

    if (selectedMode.value === 'test') {
      const currentUid = normalizeString(uid.value)
      if (!currentUid) return []

      return testProjects.value.filter(
        (entry) =>
          normalizeString((entry as Record<string, unknown>)?.id) === currentUid
      ) as ProjectInterfaceInput[]
    }

    return demoProjects.value
  })

  const availableProjectPills = computed(() =>
    availableProjects.value
      .map((entry) =>
        buildProjectPill(entry as Project, entry.image_url, entry.id)
      )
      .filter((entry): entry is ProjectPill => Boolean(entry))
  )

  const activeProjectPill = computed(
    () =>
      availableProjectPills.value.find(
        (item) => item.id === runtime.id.value
      ) ??
      buildProjectPill(
        runtime.project.value as Project | null,
        runtime.scenario.value?.image_url,
        runtime.id.value
      )
  )

  const headerData = computed(() =>
    activeProjectPill.value
      ? {
          imageUrl: activeProjectPill.value.imageUrl,
          title: activeProjectPill.value.title,
          subtitle: activeProjectPill.value.subtitle,
        }
      : null
  )

  const console = useRuntimeConsole({
    family: 'projects',
    selectedId: runtime.id,
    mode: selectedMode,
    setMode: (mode) => {
      projectSelection.setRuntimeProject({ mode })
    },
    clearSelection: () => {
      projectSelection.setRuntimeProject({
        selectedId: '',
        mode: selectedMode.value,
      })
    },
    header: headerData,
    publishHeader: options.publishHeader,
  })

  return {
    runtime,
    scenarios,
    activeProjectPill,
    headerData,
    console,
  }
}
