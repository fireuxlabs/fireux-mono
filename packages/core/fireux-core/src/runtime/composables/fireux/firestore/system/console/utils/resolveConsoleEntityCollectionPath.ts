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
  explicitPath?: string | null
  useAppOverlay?: boolean
}

const normalizePathPart = (value: unknown) =>
  String(value ?? '')
    .trim()
    .replace(/^\/+|\/+$/g, '')

const resolveTestCollectionPath = (family: string) =>
  family.startsWith('test-') ? family : `test-${family}`

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

  const appId = normalizePathPart(options.appId)
  if (options.useAppOverlay && appId) {
    return `apps/${appId}/${family}`
  }

  return family
}
