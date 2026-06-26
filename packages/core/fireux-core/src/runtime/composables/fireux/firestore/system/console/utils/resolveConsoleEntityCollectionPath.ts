export type ConsoleEntityRuntimeMode = 'live' | 'test' | 'demo'

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
  target?: { app_scope?: unknown, app_scope_app_id?: unknown } | null
  explicitPath?: string | null
  useAppOverlay?: boolean
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
  target?: { app_scope?: unknown, app_scope_app_id?: unknown } | null,
  fallbackAppId?: string | null
) {
  const appScope = record(target?.app_scope)

  return (
    normalizePathPart(appScope.app_id) ||
    normalizePathPart(target?.app_scope_app_id) ||
    normalizePathPart(fallbackAppId)
  )
}

export function resolveConsoleEntityCollectionPath(
  options: ResolveConsoleEntityCollectionPathOptions
) {
  const explicitPath = normalizePathPart(options.explicitPath)
  if (explicitPath) return explicitPath

  const family = normalizePathPart(options.family)
  if (!family) return ''

  const mode = options.mode ?? 'live'
  if (mode === 'demo') return ''

  if (mode === 'test') {
    return resolveTestCollectionPath(family)
  }

  const appId = resolveConsoleEntityAppId(options.target, options.appId)
  if (options.useAppOverlay && appId) {
    return `apps/${appId}/${family}`
  }

  return family
}
