import type { ComputedRef, Ref } from 'vue'
import type { User } from 'firebase/auth'
import type { UseProjectCollectionReturn } from '../../useProjectCollection'
import type { ProjectSurface } from '../../useProjectInterface'

export type ProjectWorkspace = {
  user: {
    currentUser: Ref<User | null>
    canOwnMultipleWorkspaces: ComputedRef<boolean>
  }
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
    canCreate: ComputedRef<boolean>
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
}
