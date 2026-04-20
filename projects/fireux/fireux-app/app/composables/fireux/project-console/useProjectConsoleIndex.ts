import { computed } from 'vue'
import { useConsoleIndex } from 'fireux-core/runtime/composables/fireux/console/useConsoleIndex'
import { getDemoProjects } from 'fireux-core/runtime/composables/fireux/app/utils/project-demo-scenarios/demo-scenarios/index'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { useProjectCollection } from 'fireux-core/runtime/composables/fireux/firestore/core/project/fetch/useProjectCollection'
import { useProjectFetch } from 'fireux-core/runtime/composables/fireux/firestore/core/project/fetch/useProjectFetch'
import { useProjectCreate } from 'fireux-core/runtime/composables/fireux/firestore/core/project/mutations/useProjectCreate'
import { type ProjectSurface } from 'fireux-core/runtime/composables/fireux/firestore/core/project/utils/view/useProjectInterface'
import { useProjectConsole } from './useProjectConsole'

type DemoProjectListItem = {
  id: string
  name: string
  label: string
  image_url?: string
}

const normalizeString = (value: unknown) => String(value ?? '').trim()

export function useProjectConsoleIndex() {
  const { projects: liveProjectSource } = useProjectCollection({ scope: 'mine' })
  const { uid } = useAuth()
  const { project: testProjectSource, pending: testProjectPending } = useProjectFetch(uid, {
    source: 'test',
  })
  const { createTestProject } = useProjectCreate()
  const { selectProject } = useProjectConsole()

  const sourceProjects = computed(() => ({
    live: Array.isArray(liveProjectSource.value) ? liveProjectSource.value : [],
    demo: getDemoProjects(),
    test: testProjectSource.value,
  }))

  const consoleIndex = useConsoleIndex<ProjectSurface, DemoProjectListItem, ProjectSurface>({
    entities: sourceProjects,
    selectEntity: selectProject,
    getTestId: (project) => String(project.id ?? '').trim(),
    autoCreateTest: true,
    testPending: testProjectPending,
    testCreateKey: uid,
    createTestEntity: async ({ avatarSrc, displayName }) => {
      const testId = normalizeString(uid.value)
      if (!testId) return null

      const userLabel = normalizeString(displayName) || `User ${testId.slice(0, 6)}`
      const result = await createTestProject(
        {
          id: testId,
          name: 'Test Project',
          subtitle: userLabel,
          image_url: normalizeString(avatarSrc),
        }
      )

      return normalizeString(result.id)
    },
  })

  return {
    state: consoleIndex.state,
    user: consoleIndex.user,
    projects: consoleIndex.entities,
    actions: consoleIndex.actions,
  }
}
