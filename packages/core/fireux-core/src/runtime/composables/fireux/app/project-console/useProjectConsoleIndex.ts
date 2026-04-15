import { computed } from 'vue'
import { useProjectCollection } from '../../firestore/system/project/fetch/useProjectCollection'
import { getDemoProjectScenarioList } from './demo-scenarios/index'
import { useProjectConsole } from './useProjectConsole'
import { useProjectSelection } from './useProjectSelection'

type UseProjectConsoleIndexOptions = {
  publishHeader?: boolean
}

export function useProjectConsoleIndex(
  options: UseProjectConsoleIndexOptions = {}
) {
  const { project, consoleState } = useProjectConsole({
    publishHeader: options.publishHeader,
  })
  const { setRuntimeProject } = useProjectSelection()
  const { projects } = useProjectCollection()

  const liveProjects = computed(() => projects.value ?? [])
  const demoProjects = computed(() => getDemoProjectScenarioList())

  const selectProject = (projectId: string) => {
    setRuntimeProject({ projectId, mode: 'live' })
  }

  const selectDemoProject = (projectId: string) => {
    setRuntimeProject({ projectId, mode: 'demo' })
  }

  return {
    project,
    liveProjects,
    demoProjects,
    clearSelection: consoleState.clearSelection,
    selectProject,
    selectDemoProject,
  }
}