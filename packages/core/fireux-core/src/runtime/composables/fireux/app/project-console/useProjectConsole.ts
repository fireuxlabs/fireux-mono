import { computed } from 'vue'
import { useConsoleEntityAdapter } from '../../console/useConsoleEntityAdapter'
import { useProjectCollection } from '../../firestore/system/project/fetch/useProjectCollection'
import { useProjectInterface } from '../../firestore/system/project/utils/view/useProjectInterface'
import { useProjectSelection } from './useProjectSelection'

type UseProjectConsoleOptions = {
  publishHeader?: boolean
}

/**
 * Compatibility wrapper for project console consumers that still import the
 * old project-console branch while the shared console selection APIs are in use.
 */
export function useProjectConsole(options: UseProjectConsoleOptions = {}) {
  const projectSelection = useProjectSelection()
  const { selectedId, mode, setRuntimeProject, clearRuntimeProject } = projectSelection
  const { projects } = useProjectCollection({ scope: 'mine' })
  const { pill } = useProjectInterface()

  const entity = computed(
    () =>
      projects.value.find((project) => String(project?.id || '').trim() === selectedId.value) ??
      null
  )

  const project = computed(() => pill(entity.value))
  const { headerData, consoleState } = useConsoleEntityAdapter({
    family: 'projects',
    selectedId,
    mode,
    setMode: (nextMode) => setRuntimeProject({ mode: nextMode }),
    clearSelection: clearRuntimeProject,
    card: project,
    publishHeader: options.publishHeader === true,
  })

  const clearSelectedProject = () => {
    clearRuntimeProject()
  }

  const projectState = {
    id: selectedId,
    entity,
    mode,
    isDemo: computed(() => mode.value === 'demo'),
    scenario: computed(() => null),
  }

  return {
    project,
    projectState,
    headerData,
    consoleState,
    clearSelectedProject,
  }
}
