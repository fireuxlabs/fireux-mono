// Concurrent edit — 2026-07-19 17:36 CEST — Repo Efficiency Pass 6 of 6: use outcome as target-state authority.
// Concurrent edit — 2026-07-20 16:19 CEST — Console Spine project cleanup: identify authoritative Project targets.
import { computed, type Ref } from 'vue'
import { useConsoleIndex } from '../../../app/console/useConsoleIndex'
import type { ProjectCollectionFilter } from '../../../firestore/core/project/fetch/useProjectCollection'
import type { ProjectSurface } from '../../../firestore/core/project/utils/view/useProjectInterface'
import { useProjectConsole } from '../core/useProjectConsole'

type UseProjectConsoleIndexOptions = {
  filter?: ProjectCollectionFilter | Ref<ProjectCollectionFilter | null | undefined> | null
}

export function useProjectConsoleIndex(
  options: UseProjectConsoleIndexOptions = {}
) {
  const {
    projects,
    selection: consoleSelection,
    runtime: consoleRuntime,
    actions: consoleActions,
  } = useProjectConsole({
    filter: options.filter,
  })
  const selection = computed(() => ({
    project: consoleSelection.project.value,
    projectId: consoleSelection.projectId.value,
  }))
  const runtime = computed(() => ({
    rootCollection: consoleRuntime.rootCollection.value,
    readOnly: consoleRuntime.readOnly.value,
    canWrite: consoleRuntime.canWrite.value,
  }))
  const debug = computed(() => ({
    projectId: consoleSelection.projectId.value,
    rootCollection: consoleRuntime.rootCollection.value,
    readOnly: consoleRuntime.readOnly.value,
    canWrite: consoleRuntime.canWrite.value,
    selectedProject: consoleSelection.project.value,
    targetCount: projects.count.value,
    authority: 'fireux-app-admin',
    dataType: consoleRuntime.dataType.value,
  }))

  return useConsoleIndex({
    selection,
    selectedId: computed(() => consoleSelection.projectId.value),
    autoSelectTargetId: computed(() =>
      projects.targets.value.length === 1
        ? String(projects.targets.value[0]?.id || '').trim()
        : ''
    ),
    runtime,
    targets: projects.targets,
    outcome: projects.outcome,
    getTargetId: (project: ProjectSurface) => String(project?.id ?? '').trim(),
    selectTarget: (id: string) => {
      consoleActions.selectProject(String(id ?? '').trim())
    },
    clearSelection: consoleActions.clearSelectedProject,
    debug,
  })
}
