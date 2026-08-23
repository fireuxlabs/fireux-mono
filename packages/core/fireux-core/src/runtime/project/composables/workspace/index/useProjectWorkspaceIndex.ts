// Concurrent edit — 2026-07-19 17:36 CEST — Repo Efficiency Pass 6 of 6: use outcome as target-state authority.
// Concurrent edit — 2026-07-20 16:19 CEST — Workspace Spine project cleanup: identify authoritative Project targets.
import { computed } from 'vue'
import { useProjectWorkspace } from '../core/useProjectWorkspace'

export function useProjectWorkspaceIndex() {
  const {
    projects,
    selection: workspaceSelection,
    runtime: workspaceRuntime,
    actions: workspaceActions,
  } = useProjectWorkspace()
  const debug = computed(() => ({
    projectId: workspaceSelection.projectId.value,
    rootCollection: workspaceRuntime.rootCollection.value,
    readOnly: workspaceRuntime.readOnly.value,
    canWrite: workspaceRuntime.canWrite.value,
    selectedProject: workspaceSelection.project.value,
    targetCount: projects.count.value,
    authority: 'fireux-app-admin',
    dataType: workspaceRuntime.dataType.value,
  }))

  return {
    project: workspaceSelection.project,
    projectId: workspaceSelection.projectId,
    projects: projects.targets,
    outcome: projects.outcome,
    selectProject: workspaceActions.selectProject,
    clearProject: workspaceActions.clearSelectedProject,
    debug,
  }
}
