import { computed } from 'vue'
import { toConsoleSelectionStateKey } from 'fireux-core/runtime/composables/fireux/app/routing/consoleRoutes'
import { useConsoleEntityAdapter } from '../../console/useConsoleEntityAdapter'
import {
  normalizeConsoleMode,
  normalizeString,
} from '../../console/console.normalize'
import type { ConsoleMode } from '../../console/console.types'
import {
  selectionKey,
  useConsoleSelection,
} from '../../console/useConsoleSelection'
import { useProjectCollection } from '../../firestore/core/project/fetch/useProjectCollection'
import { useProjectInterface } from '../../firestore/core/project/utils/view/useProjectInterface'

type UseProjectConsoleOptions = {
  publishHeader?: boolean
}

type ProjectConsoleSelectionState = {
  selectedId: string
  mode: ConsoleMode
}

const COOKIE_KEY = toConsoleSelectionStateKey('projects')

const normalizeSelectionState = (value: unknown): ProjectConsoleSelectionState => {
  const source = value && typeof value === 'object' ? (value as Record<string, unknown>) : {}

  return {
    selectedId: normalizeString(source.selectedId ?? source.projectId),
    mode: normalizeConsoleMode(source.mode, { defaultMode: 'live' }),
  }
}

export function useProjectConsole(options: UseProjectConsoleOptions = {}) {
  const selection = useConsoleSelection<ProjectConsoleSelectionState>({
    cookieKey: COOKIE_KEY,
    defaultState: () => ({ selectedId: '', mode: 'live' }),
    normalizeState: normalizeSelectionState,
  })
  const selectedId = selectionKey(selection, 'selectedId')
  const mode = selectionKey(selection, 'mode')
  const { projects: liveProjects } = useProjectCollection({ scope: 'mine' })
  const { pill } = useProjectInterface()
  const projects = computed(() => liveProjects.value ?? [])

  const selectProject = (projectId: string, nextMode: ConsoleMode = 'live') => {
    selection.set({
      selectedId: normalizeString(projectId),
      mode: normalizeConsoleMode(nextMode, { defaultMode: mode.value }),
    })
  }

  const clearSelectedProject = () => {
    selection.clear()
  }

  const selectedProject = computed(
    () =>
      projects.value.find((project) => String(project?.id || '').trim() === selectedId.value) ??
      null
  )

  const project = computed(() => pill(selectedProject.value))
  const { consoleState } = useConsoleEntityAdapter({
    family: 'projects',
    selectedId,
    mode,
    setMode: (nextMode) =>
      selection.set({
        mode: normalizeConsoleMode(nextMode, { defaultMode: mode.value }),
      }),
    clearSelection: clearSelectedProject,
    card: project,
    publishHeader: options.publishHeader === true,
  })

  const projectState = {
    id: selectedId,
    entity: selectedProject,
    isDemo: computed(() => mode.value === 'demo'),
    scenario: computed(() => null),
  }

  return {
    projects,
    selectedProject,
    mode,
    selectProject,
    clearSelectedProject,
    project,
    projectState,
    consoleState,
  }
}
