// Concurrent edit — 2026-07-20 23:46 CEST — App Support Vocabulary Pass: select App support paths without overlay terminology.
import type { ConsoleSource } from '../../../../app/console/useConsole'
import { readFireuxEntityManagement } from '../../../../../../utils/entity-management'
import type { FireuxEntityManagement } from '../../../../../../models/utils/scope.model'

export type ConsoleEntityRuntimeMode = ConsoleSource

export type ConsoleEntityCollectionFamily =
  string

export type ResolveConsoleEntityCollectionPathOptions = {
  family: ConsoleEntityCollectionFamily
  mode?: ConsoleEntityRuntimeMode | null
  appId?: string | null
  target?: ConsoleEntityScopeTarget | null
  explicitPath?: string | null
  useAppSupport?: boolean
}

export type ConsoleEntityScopeState =
  | ''
  | FireuxEntityManagement['mode']

export type ConsoleEntityScopeTarget = { management?: unknown }

const normalizePathPart = (value: unknown) =>
  String(value ?? '')
    .trim()
    .replace(/^\/+|\/+$/g, '')
const record = (value: unknown): Record<string, unknown> =>
  value && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {}

const resolveTestCollectionPath = (family: string) =>
  family.startsWith('test-') ? family : `test-${family}`

export function resolveConsoleEntityAppId(
  target?: ConsoleEntityScopeTarget | null,
  fallbackAppId?: string | null
) {
  const management = readFireuxEntityManagement(target?.management)
  if (management?.mode === 'app') return normalizePathPart(management.app_id)
  if (management?.mode === 'console') return normalizePathPart(fallbackAppId)
  return ''
}

export function resolveConsoleEntityScopeState(
  target?: ConsoleEntityScopeTarget | null
): ConsoleEntityScopeState {
  return readFireuxEntityManagement(target?.management)?.mode || ''
}

export function consoleEntityUsesAppScope(
  target?: ConsoleEntityScopeTarget | null
) {
  const state = resolveConsoleEntityScopeState(target)
  return state === 'console' || state === 'app'
}

export function resolveConsoleEntityCollectionPath(
  options: ResolveConsoleEntityCollectionPathOptions
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

  const appId = resolveConsoleEntityAppId(options.target, options.appId)
  if (options.useAppSupport && appId) {
    return `apps/${appId}/${family}`
  }

  return family
}
