import { computed } from 'vue'
import { useConsoleEntityAdapter } from '../../console/useConsoleEntityAdapter'
import { useProjectCollection } from '../../firestore/core/project/fetch/useProjectCollection'
import { useProjectInterface } from '../../firestore/core/project/utils/view/useProjectInterface'
import { useProjectSelection } from './useProjectSelection'

type UseProjectConsoleOptions = {
  publishHeader?: boolean
}

export function useProjectConsole(options: UseProjectConsoleOptions = {}) {
  const { selectedId, mode, setRuntimeProject, clearRuntimeProject } = useProjectSelection()
  const { projects } = useProjectCollection({ scope: 'mine' })
  const { pill } = useProjectInterface()

  const entity = computed(
    () =>
      projects.value.find((project) => String(project?.id || '').trim() === selectedId.value) ??
      null
  )

  const project = computed(() => pill(entity.value))
  const { consoleState } = useConsoleEntityAdapter({
    family: 'projects',
    selectedId,
    mode,
    setMode: (nextMode) => setRuntimeProject({ mode: nextMode }),
    clearSelection: clearRuntimeProject,
    card: project,
    publishHeader: options.publishHeader === true,
  })

  const projectState = {
    id: selectedId,
    entity,
    isDemo: computed(() => mode.value === 'demo'),
    scenario: computed(() => null),
  }

  return {
    project,
    projectState,
    consoleState,
  }
}
