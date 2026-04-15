import { computed } from 'vue'
import type { Project } from '../../../../models/system/project.model'
import { useConsoleEntityAdapter } from '../../console/useConsoleEntityAdapter'
import { useProjectInterface } from '../../firestore/system/project/utils/view/useProjectInterface'
import { useProjectSelection } from './useProjectSelection'
import { useActiveProject } from './useActiveProject'

type UseProjectConsoleOptions = {
  publishHeader?: boolean
}

/**
 * Project console adapter.
 * Keeps only the active pill, header data, and shared console-state wiring.
 */
export function useProjectConsole(
  options: UseProjectConsoleOptions = {}
) {
  const projectState = useActiveProject()
  const projectSelection = useProjectSelection()
  const { pill: toProjectCard } = useProjectInterface()

  const project = computed(() =>
    toProjectCard(projectState.entity.value as Project | null)
  )

  const { headerData, consoleState } = useConsoleEntityAdapter({
    family: 'projects',
    selectedId: projectState.id,
    mode: projectState.mode,
    setMode: (mode) => projectSelection.setRuntimeProject({ mode }),
    clearSelection: projectSelection.clearRuntimeProject,
    card: project,
    publishHeader: options.publishHeader,
  })

  return {
    projectState,
    project,
    headerData,
    consoleState,
  }
}
