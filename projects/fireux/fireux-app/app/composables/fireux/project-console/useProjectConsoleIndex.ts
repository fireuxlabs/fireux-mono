import { computed, type Ref } from 'vue'
import { normalizeConsoleString as normalizeString } from 'fireux-core/runtime/composables/fireux/app/console/useConsole'
import { useConsoleIndex } from 'fireux-core/runtime/composables/fireux/app/console/useConsoleIndex'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import type { ProjectCollectionFilter } from 'fireux-core/runtime/composables/fireux/firestore/core/project/fetch/useProjectCollection'
import { useProjectFetch } from 'fireux-core/runtime/composables/fireux/firestore/core/project/fetch/useProjectFetch'
import { useProjectCreate } from 'fireux-core/runtime/composables/fireux/firestore/core/project/mutations/useProjectCreate'
import { type ProjectSurface } from 'fireux-core/runtime/composables/fireux/firestore/core/project/utils/view/useProjectInterface'
import { useProjectConsole } from './useProjectConsole'

type UseProjectConsoleIndexOptions = {
  filter?: ProjectCollectionFilter | Ref<ProjectCollectionFilter | null | undefined> | null
}

export function useProjectConsoleIndex(
  options: UseProjectConsoleIndexOptions = {}
) {
  const { uid } = useAuth()
  const userId = computed(() => normalizeString(uid.value))
  const { project: testProjectSource, pending: testProjectPending } = useProjectFetch(userId, {
    source: 'test',
  })
  const { createTestProject } = useProjectCreate()
  const {
    liveProjects,
    demoProjects,
    selectProject,
    selectedProject,
    selectedMode,
    projectId,
    rootCollection,
    canWrite,
    clearSelectedProject,
  } = useProjectConsole({
    filter: options.filter,
  })

  const sourceProjects = computed(() => ({
    live: liveProjects.value,
    demo: demoProjects.value,
    test: testProjectSource.value,
  }))

  const consoleIndex = useConsoleIndex<ProjectSurface, ProjectSurface, ProjectSurface>({
    entities: sourceProjects,
    selectEntity: selectProject,
    getTestId: (project) => normalizeString(project.id),
    autoCreateTest: true,
    testPending: testProjectPending,
    testCreateKey: userId,
    createTestEntity: async ({ avatarSrc, displayName }) => {
      const testId = userId.value
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
  const debug = computed(() => ({
    mode: selectedMode.value,
    projectId: projectId.value,
    rootCollection: rootCollection.value,
    canWrite: canWrite.value,
    selectedProject: selectedProject.value,
    counts: {
      live: consoleIndex.entities.value.live.length,
      demo: consoleIndex.entities.value.demo.length,
      test: consoleIndex.entities.value.test ? 1 : 0,
    },
  }))

  return {
    state: consoleIndex.state,
    user: consoleIndex.user,
    projects: consoleIndex.entities,
    actions: consoleIndex.actions,
    selectedProject,
    selectedMode,
    projectId,
    rootCollection,
    canWrite,
    debug,
    clearSelectedProject,
  }
}
