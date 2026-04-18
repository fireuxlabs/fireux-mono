import { computed } from 'vue'
import { useConsoleIndex } from 'fireux-core/runtime/composables/fireux/console/useConsoleIndex'
import { getDemoProjects } from 'fireux-core/runtime/composables/fireux/app/utils/project-demo-scenarios/demo-scenarios/index'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { useProjectCollection } from 'fireux-core/runtime/composables/fireux/firestore/core/project/fetch/useProjectCollection'
import { useProjectFetch } from 'fireux-core/runtime/composables/fireux/firestore/core/project/fetch/useProjectFetch'
import { type ProjectSurface } from 'fireux-core/runtime/composables/fireux/firestore/core/project/utils/view/useProjectInterface'
import { useProjectConsole } from './useProjectConsole'

type DemoProjectListItem = {
  id: string
  name: string
  label: string
  image_url?: string
}

export function useProjectConsoleIndex() {
  const { projects: liveProjectSource } = useProjectCollection({ scope: 'mine' })
  const { uid } = useAuth()
  const { project: testProjectSource } = useProjectFetch(uid, { source: 'test' })
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
  })

  return {
    state: consoleIndex.state,
    user: consoleIndex.user,
    projects: consoleIndex.entities,
    actions: consoleIndex.actions,
  }
}
