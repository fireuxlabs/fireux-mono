import { useState } from '#imports'
import { computed } from 'vue'
import { normalizeString } from '../../../utils/string'
import { normalizeWorkspaceFamily } from './useWorkspace'
import {
  normalizeWorkspaceDataType,
  type WorkspaceDataType,
} from './useWorkspaceData'

export type WorkspaceDataAuthority = Readonly<{
  id: string
  type: WorkspaceDataType
}>

/**
 * Request-local authority resolved by a Workspace provider.
 *
 * Selection persists intent. This state becomes writable authority only after
 * the provider resolves the exact selected `{ id, type }` target envelope.
 */
export function useWorkspaceDataAuthority(family: string) {
  const normalizedFamily = normalizeWorkspaceFamily(family)
  const state = useState<WorkspaceDataAuthority | null>(
    `fireux-workspace-${normalizedFamily}-data-authority`,
    () => null
  )
  const authority = computed<WorkspaceDataAuthority | null>(() => {
    const id = normalizeString(state.value?.id)
    const type = normalizeWorkspaceDataType(state.value?.type)
    return id && type ? { id, type } : null
  })

  const setAuthority = (
    id: string | null | undefined,
    type: WorkspaceDataType | null | undefined
  ) => {
    const nextId = normalizeString(id)
    const nextType = normalizeWorkspaceDataType(type)
    state.value =
      nextId && nextType
        ? {
            id: nextId,
            type: nextType,
          }
        : null
  }

  const clearAuthority = () => {
    state.value = null
  }

  return {
    authority,
    setAuthority,
    clearAuthority,
  }
}
