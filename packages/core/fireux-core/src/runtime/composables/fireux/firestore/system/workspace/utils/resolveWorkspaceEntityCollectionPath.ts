// Concurrent edit — 2026-07-20 23:46 CEST — App Support Vocabulary Pass: select App support paths without overlay terminology.
import type { WorkspaceSource } from '../../../../workspace/useWorkspace'
import { readFireuxEntityManagement } from '../../../../../../utils/entity-management'
import type { FireuxEntityManagement } from '../../../../../../models/utils/scope.model'

export type WorkspaceEntityRuntimeMode = WorkspaceSource

export type WorkspaceEntityCollectionFamily =
  string

export type ResolveWorkspaceEntityCollectionPathOptions = {
  family: WorkspaceEntityCollectionFamily
  mode?: WorkspaceEntityRuntimeMode | null
  appId?: string | null
  target?: WorkspaceEntityScopeTarget | null
  explicitPath?: string | null
  useAppSupport?: boolean
}

export type WorkspaceEntityScopeState =
  | ''
  | FireuxEntityManagement['mode']

export type WorkspaceEntityScopeTarget = { management?: unknown }

const normalizePathPart = (value: unknown) =>
  String(value ?? '')
    .trim()
    .replace(/^\/+|\/+$/g, '')
const resolveTestCollectionPath = (family: string) =>
  family.startsWith('test-') ? family : `test-${family}`

export function resolveWorkspaceEntityAppId(
  target?: WorkspaceEntityScopeTarget | null,
  fallbackAppId?: string | null
) {
  const management = readFireuxEntityManagement(target?.management)
  if (management?.mode === 'app') return normalizePathPart(management.app_id)
  if (management?.mode === 'workspace') return normalizePathPart(fallbackAppId)
  return ''
}

export function resolveWorkspaceEntityScopeState(
  target?: WorkspaceEntityScopeTarget | null
): WorkspaceEntityScopeState {
  return readFireuxEntityManagement(target?.management)?.mode || ''
}

export function workspaceEntityUsesAppScope(
  target?: WorkspaceEntityScopeTarget | null
) {
  const state = resolveWorkspaceEntityScopeState(target)
  return state === 'workspace' || state === 'app'
}

export function resolveWorkspaceEntityCollectionPath(
  options: ResolveWorkspaceEntityCollectionPathOptions
) {
  const mode = options.mode ?? 'live'
  if (mode === 'demo') return ''

  const explicitPath = normalizePathPart(options.explicitPath)
  if (explicitPath) return explicitPath

  const family = normalizePathPart(options.family)
  if (!family) return ''

  if (mode === 'test') {
    return resolveTestCollectionPath(family)
  }

  const appId = resolveWorkspaceEntityAppId(options.target, options.appId)
  if (options.useAppSupport && appId) {
    return `apps/${appId}/${family}`
  }

  return family
}
