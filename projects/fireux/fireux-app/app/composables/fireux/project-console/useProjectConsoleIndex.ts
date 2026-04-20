import { computed } from 'vue'
import { useConsoleIndex } from 'fireux-core/runtime/composables/fireux/console/useConsoleIndex'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
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
  const { appId, ecosystem } = useFireUXConfig()
  const { project: testProjectSource } = useProjectFetch(uid, { source: 'test' })
  const { ensureProject } = useProjectCreate({ test: true })
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
    createTestEntity: async ({ avatarSrc, displayName }) => {
      const testId = normalizeString(uid.value)
      if (!testId) return null

      const testName = normalizeString(displayName) || `User ${testId.slice(0, 6)}`
      const result = await ensureProject(
        {
          id: testId,
          name: testName,
          slug: testId,
          description: '',
          image_url: normalizeString(avatarSrc),
          primary_project: false,
          project_type: 'standalone_app',
          source_url: `/console/projects/test/${testId}`,
          console_endpoint_url: '/console/projects',
          app_id: normalizeString(appId),
          ecosystem_id: normalizeString(ecosystem),
          firebase_project_id: `test-${testId}`,
          status: 'active',
        },
        {
          mode: 'console',
          existingRootId: testId,
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
