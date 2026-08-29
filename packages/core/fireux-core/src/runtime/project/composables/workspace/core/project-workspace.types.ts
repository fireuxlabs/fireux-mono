import type { ComputedRef } from 'vue'
import type { WorkspacePageState } from '../../../../composables/fireux/workspace/useWorkspacePageState'
import type { UseProjectCollectionReturn } from '../../useProjectCollection'
import type { ProjectSurface } from '../../useProjectInterface'

export type ProjectWorkspace = {
  targets: UseProjectCollectionReturn
  selection: {
    project: ComputedRef<ProjectSurface | null>
    projectId: ComputedRef<string>
    projectSource: ComputedRef<'live'>
    hasSelection: ComputedRef<boolean>
  }
  runtime: {
    appId: ComputedRef<string>
    ecosystem: ComputedRef<string>
    source: ComputedRef<'live'>
    dataType: ComputedRef<'live'>
    rootCollection: ComputedRef<string>
    isDemo: ComputedRef<boolean>
    readOnly: ComputedRef<boolean>
    canWrite: ComputedRef<boolean>
  }
  actions: {
    selectProject: (
      id: string,
      name?: string,
      description?: string,
      image?: string
    ) => void
    clearSelectedProject: () => void
  }
  state: ComputedRef<WorkspacePageState | null>
}
