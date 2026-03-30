type ConsoleMode = 'live' | 'test' | 'read-only'

type ResolveConsoleTestRuntimeIdInput = {
  entityKey: string
  uid?: unknown
}

const toText = (value: unknown): string => String(value ?? '').trim()

const toSlug = (value: unknown): string =>
  toText(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

const normalizeBasePath = (value: unknown): string => {
  const path = `/${toText(value)}`.replace(/\/+/g, '/')
  return path.endsWith('/') && path.length > 1 ? path.slice(0, -1) : path
}

export function resolveConsoleEntryPath(
  basePath: string,
  mode: ConsoleMode,
  id?: string
): string {
  const normalizedBasePath = normalizeBasePath(basePath)

  if (mode === 'test') {
    return `${normalizedBasePath}/test`
  }

  if (mode === 'read-only') {
    return `${normalizedBasePath}/overview`
  }

  return `${normalizedBasePath}/overview`
}

export function resolveConsoleTestRuntimeId(
  input: ResolveConsoleTestRuntimeIdInput
): string {
  const normalizedUid = toSlug(input.uid)
  if (normalizedUid) return `user-${normalizedUid}`

  const normalizedEntityKey = toSlug(input.entityKey) || 'console'
  return `guest-${normalizedEntityKey}`
}
