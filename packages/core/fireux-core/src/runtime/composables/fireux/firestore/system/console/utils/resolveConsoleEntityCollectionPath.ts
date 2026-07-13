import type { ConsoleSource } from '../../../../app/console/useConsole'

export type ConsoleEntityRuntimeMode = ConsoleSource

export type ConsoleEntityCollectionFamily =
  | 'kitchens'
  | 'portfolios'
  | 'projects'
  | 'suppliers'
  | 'profiles'
  | (string & {})

export type ResolveConsoleEntityCollectionPathOptions = {
  family: ConsoleEntityCollectionFamily
  mode?: ConsoleEntityRuntimeMode | null
  appId?: string | null
  target?: ConsoleEntityScopeTarget | null
  explicitPath?: string | null
  useAppOverlay?: boolean
}

export type ConsoleEntityScopeState =
  | ''
  | 'root_only'
  | 'parent_app'
  | 'dedicated_app'

export type ConsoleEntityScopeTarget = {
  app_scope?: unknown
  app_scope_state?: unknown
  app_scope_app_id?: unknown
}

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
  const appScope = record(target?.app_scope)

  return (
    normalizePathPart(appScope.app_id) ||
    normalizePathPart(target?.app_scope_app_id) ||
    normalizePathPart(fallbackAppId)
  )
}

export function resolveConsoleEntityScopeState(
  target?: ConsoleEntityScopeTarget | null
): ConsoleEntityScopeState {
  const appScope = record(target?.app_scope)
  const state = normalizePathPart(appScope.state) ||
    normalizePathPart(target?.app_scope_state)

  if (
    state === 'root_only' ||
    state === 'parent_app' ||
    state === 'dedicated_app'
  ) {
    return state
  }

  return ''
}

export function consoleEntityUsesAppScope(
  target?: ConsoleEntityScopeTarget | null
) {
  const state = resolveConsoleEntityScopeState(target)
  return state === 'parent_app' || state === 'dedicated_app'
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
  if (options.useAppOverlay && appId) {
    return `apps/${appId}/${family}`
  }

  return family
}
