import { normalizeString } from '../../../utils/string'
import type { WorkspaceSource } from './useWorkspace'

export type WorkspaceDataType = WorkspaceSource

/**
 * Non-persisted provenance for data entering a Workspace runtime.
 *
 * The envelope keeps Workspace metadata out of domain records. Providers create
 * it at their boundary; views receive only `value`.
 */
export type WorkspaceData<T> = Readonly<{
  type: WorkspaceDataType
  value: T
}>

export function normalizeWorkspaceDataType(
  value: unknown
): WorkspaceDataType | null {
  const dataType = normalizeString(value).toLowerCase()
  if (dataType === 'demo' || dataType === 'test' || dataType === 'live') {
    return dataType
  }
  return null
}

export function workspaceData<T>(
  type: WorkspaceDataType,
  value: T
): WorkspaceData<T> {
  const normalizedType = normalizeWorkspaceDataType(type)
  if (!normalizedType) {
    throw new Error('Workspace data requires a valid type.')
  }
  return {
    type: normalizedType,
    value,
  }
}

export function isWorkspaceDemoData<T>(
  data: WorkspaceData<T> | null | undefined
): boolean {
  return data?.type === 'demo'
}
