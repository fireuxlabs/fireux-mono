// Concurrent edit — 2026-07-19 17:36 CEST — Repo Efficiency Pass 6 of 6: use outcome as target-state authority.
// Concurrent edit — 2026-07-20 16:19 CEST — Console Spine project cleanup: identify authoritative Project targets.
import { computed } from 'vue'
import { useConsoleIndex } from '../../../app/console/useConsoleIndex'
import type { ProjectSurface } from '../../../project/useProjectInterface'
import { useProjectConsole } from '../core/useProjectConsole'

export function useProjectConsoleIndex() {
  const {
    projects,
    selection: consoleSelection,
    runtime: consoleRuntime,
    actions: consoleActions,
  } = useProjectConsole()
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
