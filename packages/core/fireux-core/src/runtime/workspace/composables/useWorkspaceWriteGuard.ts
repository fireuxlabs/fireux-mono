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
  const { selectedId } = useWorkspace(workspace)

  const requireWritableData = () => {
    if (!selectedId.value) throw new WorkspaceSelectionRequiredError(workspace)
    return selectedId.value
  }

  return {
    selectedType: computed(() => (selectedId.value ? 'workspace' as const : null)),
    requireWritableData,
  }
}
