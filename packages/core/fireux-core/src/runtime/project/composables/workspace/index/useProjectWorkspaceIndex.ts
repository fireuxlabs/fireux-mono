// Concurrent edit — 2026-07-19 17:36 CEST — Repo Efficiency Pass 6 of 6: use outcome as target-state authority.
// Concurrent edit — 2026-07-20 16:19 CEST — Workspace Spine project cleanup: identify authoritative Project targets.
import { computed } from 'vue'
import {
  resolveWorkspaceSelectedTargetOutcome,
  useWorkspaceIndex,
} from '../../../../composables/fireux/workspace/useWorkspaceIndex'
import type { ProjectSurface } from '../../useProjectInterface'
import { useProjectWorkspace } from '../core/useProjectWorkspace'

export function useProjectWorkspaceIndex() {
  const {
    projects,
    selection: workspaceSelection,
    runtime: workspaceRuntime,
    actions: workspaceActions,
  } = useProjectWorkspace()
  const selectedOutcome = computed(() =>
    resolveWorkspaceSelectedTargetOutcome({
      selectedId: workspaceSelection.projectId.value,
      selectedTarget: workspaceSelection.project.value,
      targetOutcome: projects.outcome.value,
    })
  )
  const selection = computed(() => ({
    project: workspaceSelection.project.value,
    projectId: workspaceSelection.projectId.value,
    outcome: selectedOutcome.value,
  }))
  const runtime = computed(() => ({
    rootCollection: workspaceRuntime.rootCollection.value,
    readOnly: workspaceRuntime.readOnly.value,
    canWrite: workspaceRuntime.canWrite.value,
  }))
  const debug = computed(() => ({
    projectId: workspaceSelection.projectId.value,
    rootCollection: workspaceRuntime.rootCollection.value,
    readOnly: workspaceRuntime.readOnly.value,
    canWrite: workspaceRuntime.canWrite.value,
    selectedProject: workspaceSelection.project.value,
    selectedOutcome: selectedOutcome.value,
    targetCount: projects.count.value,
    authority: 'fireux-app-admin',
    dataType: workspaceRuntime.dataType.value,
  }))

  return useWorkspaceIndex({
    selection,
    selectedId: computed(() => workspaceSelection.projectId.value),
    runtime,
    targets: projects.targets,
    outcome: projects.outcome,
    getTargetId: (project: ProjectSurface) => String(project?.id ?? '').trim(),
    selectTarget: (id: string) => {
      workspaceActions.selectProject(String(id ?? '').trim())
    },
    clearSelection: workspaceActions.clearSelectedProject,
    debug,
  })
}
