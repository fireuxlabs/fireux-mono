import { computed } from 'vue'
import { normalizeWorkspaceFamily } from './useWorkspace'
import type { WorkspaceDataType } from './useWorkspaceData'
import { useWorkspaceDataAuthority } from './useWorkspaceDataAuthority'
import { useWorkspaceSelection } from './useWorkspaceSelection'

export class WorkspaceDataReadOnlyError extends Error {
  readonly code = 'workspace-data-read-only'

  constructor(family: string) {
    super(
      `${family || 'Workspace'} Demo data is read-only.`
    )
    this.name = 'WorkspaceDataReadOnlyError'
  }
}

/**
 * Defense-in-depth for Workspace mutation, HTTP, and upload adapters.
 *
 * Server authorization and Firestore Rules remain authoritative. This gate
 * prevents a Demo-selected parent from issuing a Live request at all.
 */
export function useWorkspaceWriteGuard(family: string) {
  const normalizedFamily = normalizeWorkspaceFamily(family)
  const selection = useWorkspaceSelection(normalizedFamily)
  const { authority } = useWorkspaceDataAuthority(normalizedFamily)
  const selectedType = computed<WorkspaceDataType | null>(() => {
    const resolved = authority.value
    return resolved &&
      resolved.id === selection.selectedId.value &&
      resolved.type === selection.selectedType.value
      ? resolved.type
      : null
  })
  const isDemo = computed(
    () =>
      selection.selectedType.value === 'demo' &&
      selectedType.value === 'demo'
  )

  const requireWritableData = (
    expectedType?: WorkspaceDataType
  ): Exclude<WorkspaceDataType, 'demo'> => {
    const type = selectedType.value
    if (
      !type ||
      type === 'demo' ||
      (expectedType !== undefined && type !== expectedType)
    ) {
      throw new WorkspaceDataReadOnlyError(normalizedFamily)
    }
    return type
  }

  return {
    selectedType,
    isDemo,
    requireWritableData,
  }
}
