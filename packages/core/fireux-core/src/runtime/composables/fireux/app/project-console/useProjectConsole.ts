import { computed } from 'vue'
import { useConsoleState } from '../../console/useConsoleState'
import {
  useProjectInterface,
  type ProjectInterfaceInput,
} from '../../firestore/system/project/utils/view/useProjectInterface'
import { useProjectSelection } from './useProjectSelection'
import { useActiveProject } from './useActiveProject'

type UseProjectConsoleOptions = {
  publishHeader?: boolean
}

const normalizeString = (value: unknown): string => String(value || '').trim()

/**
 * Project console adapter.
 * Keeps only the active pill, header data, and shared console-state wiring.
 */
export function useProjectConsole(
  options: UseProjectConsoleOptions = {}
) {
  const projectState = useActiveProject()
  const projectSelection = useProjectSelection()
  const { interface: toProjectCard } = useProjectInterface()

  const project = computed(() =>
    toProjectCard(projectState.project.value as ProjectInterfaceInput | null)
  )

  const headerData = computed(() =>
    project.value
      ? {
          imageUrl: project.value.imageUrl,
          title: project.value.title,
          subtitle:
            normalizeString(project.value.subtitle) ||
            normalizeString(projectState.project.value?.id),
        }
      : null
  )

  const consoleState = useConsoleState({
    family: 'projects',
    selectedId: projectState.id,
    mode: computed(() => 'live'),
    setMode: () => {},
    clearSelection: projectSelection.clearRuntimeProject,
    header: headerData,
    publishHeader: options.publishHeader,
    modeOptions: [{ value: 'live', label: 'Real' }],
  })

  return {
    projectState,
    project,
    headerData,
    consoleState,
  }
}
