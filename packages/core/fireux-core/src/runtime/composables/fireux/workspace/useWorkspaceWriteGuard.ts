import { computed } from 'vue'
import { normalizeWorkspace, useWorkspace } from './useWorkspace'

export class WorkspaceSelectionRequiredError extends Error {
  readonly code = 'workspace-selection-required'

  constructor(workspace: string) {
    super(`Select a ${workspace || 'Workspace'} before making changes.`)
    this.name = 'WorkspaceSelectionRequiredError'
  }
}

/**
 * Temporary shared selection assertion for existing mutation consumers.
 * Domain servers and Firestore Rules remain the write authority.
 */
export function useWorkspaceWriteGuard(workspaceName: string) {
  const workspace = normalizeWorkspace(workspaceName)
  const { activeId } = useWorkspace(workspace)

  const requireWritableData = () => {
    if (!activeId.value) throw new WorkspaceSelectionRequiredError(workspace)
    return activeId.value
  }

  return {
    selectedType: computed(() => (activeId.value ? 'live' as const : null)),
    isDemo: computed(() => false),
    requireWritableData,
  }
}
