import { computed } from 'vue'
import { getDemoProjects } from 'fireux-core/runtime/composables/fireux/app/utils/project-demo-scenarios/demo-scenarios/index'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { useProjectCollection } from 'fireux-core/runtime/composables/fireux/firestore/core/project/fetch/useProjectCollection'
import { useProjectFetch } from 'fireux-core/runtime/composables/fireux/firestore/core/project/fetch/useProjectFetch'

type ProjectConsoleMode = 'live' | 'demo'

export function useProjectConsole() {
  const { projects: liveProjects } = useProjectCollection({ scope: 'mine' })
  const { uid } = useAuth()
  const { project: testProject } = useProjectFetch(uid, { source: 'test' })

  const projects = computed(() => ({
    live: liveProjects.value,
    demo: getDemoProjects(),
    test: testProject.value,
  }))
  const selectedProject: unknown = null

  const clearSelectedProject = () => undefined
  const selectProject = (
    _projectId: string,
    _mode?: ProjectConsoleMode
  ) => undefined

  return {
    projects,
    selectedProject,
    clearSelectedProject,
    selectProject,
  }
}
