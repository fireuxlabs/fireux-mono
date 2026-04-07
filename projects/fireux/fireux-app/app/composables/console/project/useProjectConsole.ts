import { computed } from 'vue'
import { useConsoleState } from 'fireux-core/runtime/composables/fireux/console/useConsoleState'
import {
  useProjectInterface,
  type ProjectInterfaceInput,
} from 'fireux-core/runtime/composables/fireux/firestore/system/project/utils/view/useProjectInterface'
import type { Project } from 'fireux-core/runtime/models/system/project.model'
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
  const runtime = useActiveProject()
  const projectSelection = useProjectSelection()
  const { interface: toProjectCard } = useProjectInterface()

  const activeProjectPill = computed(() =>
    toProjectCard(runtime.project.value as ProjectInterfaceInput | null)
  )

  const headerData = computed(() =>
    activeProjectPill.value
      ? {
          imageUrl: activeProjectPill.value.imageUrl,
          title: activeProjectPill.value.title,
          subtitle:
            normalizeString(activeProjectPill.value.subtitle) ||
            normalizeString(runtime.project.value?.id),
        }
      : null
  )

  const consoleState = useConsoleState({
    family: 'projects',
    selectedId: runtime.id,
    mode: computed(() => 'live'),
    setMode: () => {},
    clearSelection: projectSelection.clearRuntimeProject,
    header: headerData,
    publishHeader: options.publishHeader,
    modeOptions: [{ value: 'live', label: 'Real' }],
  })

  return {
    runtime,
    activeProjectPill,
    headerData,
    consoleState,
  }
}
