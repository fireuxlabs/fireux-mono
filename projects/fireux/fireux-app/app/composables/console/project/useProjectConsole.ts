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

type ProjectEcosystemCompatibilityState = {
  runtime: ReturnType<typeof useActiveProject>
  pending: Readonly<ReturnType<typeof computed<boolean>>>
  refresh: () => Promise<void>
  resolvedError: Readonly<ReturnType<typeof computed<string>>>
  ecosystemRows: Readonly<ReturnType<typeof computed<any[]>>>
  ecosystemViews: Readonly<ReturnType<typeof computed<any[]>>>
  databaseRows: Readonly<ReturnType<typeof computed<any[]>>>
  totalAppCount: Readonly<ReturnType<typeof computed<number>>>
  projectSummary: Readonly<
    ReturnType<
      typeof computed<{
        id: string
        mainAppId: string
        mainEcosystemId: string
      }>
    >
  >
  debugData: Readonly<ReturnType<typeof computed<Record<string, unknown>>>>
}

const normalizeString = (value: unknown): string => String(value || '').trim()

const createEcosystemCompatibilityState = (
  runtime: ReturnType<typeof useActiveProject>
): ProjectEcosystemCompatibilityState => ({
  runtime,
  pending: computed(() => false),
  refresh: async () => {},
  resolvedError: computed(() => ''),
  ecosystemRows: computed(() => []),
  ecosystemViews: computed(() => []),
  databaseRows: computed(() => []),
  totalAppCount: computed(() => 0),
  projectSummary: computed(() => ({
    id: '',
    mainAppId: '',
    mainEcosystemId: '',
  })),
  debugData: computed(() => ({
    disabled: true,
    reason: 'Ecosystem inspector is outside the live-only core reduction.',
  })),
})

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

  const console = useConsoleState({
    family: 'projects',
    selectedId: runtime.id,
    mode: computed(() => 'live'),
    setMode: () => {},
    clearSelection: projectSelection.clearRuntimeProject,
    header: headerData,
    publishHeader: options.publishHeader,
    modeOptions: [{ value: 'live', label: 'Real' }],
  })

  let ecosystemState: ProjectEcosystemCompatibilityState | null = null

  return {
    runtime,
    activeProjectPill,
    headerData,
    console,
    scenarios: computed(() => [] as any[]),
    get ecosystem() {
      if (!ecosystemState) {
        ecosystemState = createEcosystemCompatibilityState(runtime)
      }

      return ecosystemState
    },
  }
}
