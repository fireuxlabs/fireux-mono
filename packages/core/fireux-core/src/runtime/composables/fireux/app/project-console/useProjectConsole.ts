import { computed } from 'vue'
import { useConsoleState } from '../../console/useConsoleState'
import type { Project } from '../../../../models/system/project.model'
import {
  useProjectInterface,
} from '../../firestore/system/project/utils/view/useProjectInterface'
import { useProjectSelection } from './useProjectSelection'
import { useActiveProject } from './useActiveProject'

type UseProjectConsoleOptions = {
  publishHeader?: boolean
}

const normalizeString = (value: unknown): string => String(value || '').trim()
const family = 'projects' as const
const resolveHeaderImageUrl = (
  value: { imageUrl?: string; avatarUrl?: string } | null | undefined
) => normalizeString(value?.imageUrl ?? value?.avatarUrl) || undefined

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

  const headerData = computed(() =>
    project.value
      ? {
          imageUrl: resolveHeaderImageUrl(project.value),
          title: project.value.title,
          subtitle:
            normalizeString(project.value.subtitle) ||
            normalizeString(projectState.entity.value?.id),
        }
      : null
  )

  const consoleState = useConsoleState({
    family,
    selectedId: projectState.id,
    mode: projectState.mode,
    setMode: (mode) => projectSelection.setRuntimeProject({ mode }),
    clearSelection: projectSelection.clearRuntimeProject,
    header: headerData,
    publishHeader: options.publishHeader,
    modeOptions: [
      { value: 'live', label: 'Live' },
      { value: 'demo', label: 'Demo' },
    ] as const,
  })

  return {
    projectState,
    project,
    headerData,
    consoleState,
  }
}
