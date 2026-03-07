import type { RouteRecordNormalized } from 'vue-router'

export type ConsoleRouteLike = Pick<RouteRecordNormalized, 'path'>

export type ConsoleChildRoute = {
  key: string
  path: string
}

export function normalizeConsolePath(value?: string) {
  const trimmed = String(value || '/console').trim() || '/console'
  if (trimmed === '/') return ''
  return trimmed.endsWith('/') ? trimmed.slice(0, -1) : trimmed
}

export function normalizeConsoleScope(value: unknown) {
  return String(value || '')
    .trim()
    .toLowerCase()
}

export function isConsoleRoutePath(path: unknown, consolePath = '/console') {
  const normalizedPath = String(path || '').trim()
  const root = normalizeConsolePath(consolePath)
  return normalizedPath === root || normalizedPath.startsWith(`${root}/`)
}

export function getConsoleScopeFromPath(
  path: unknown,
  consolePath = '/console'
) {
  const normalizedPath = String(path || '').trim()
  const root = normalizeConsolePath(consolePath)

  if (!normalizedPath.startsWith(`${root}/`)) return null

  const suffix = normalizedPath.slice(root.length + 1)
  const [scope] = suffix.split('/')
  const normalizedScope = normalizeConsoleScope(scope)

  if (!normalizedScope || normalizedScope.startsWith(':') || normalizedScope.includes('[')) {
    return null
  }

  return normalizedScope
}

export function discoverConsoleChildren(
  routes: ConsoleRouteLike[],
  consolePath = '/console'
): ConsoleChildRoute[] {
  const root = normalizeConsolePath(consolePath)
  const byKey = new Map<string, string[]>()

  for (const route of routes) {
    const path = String(route.path || '')
    if (!path.startsWith(`${root}/`)) continue

    const suffix = path.slice(root.length + 1)
    const [scope] = suffix.split('/')
    const normalizedScope = normalizeConsoleScope(scope)

    if (
      !normalizedScope ||
      normalizedScope.startsWith(':') ||
      normalizedScope.includes('[')
    ) {
      continue
    }

    const list = byKey.get(normalizedScope) ?? []
    list.push(path)
    byKey.set(normalizedScope, list)
  }

  return Array.from(byKey.entries())
    .map(([key, paths]) => {
      const explicit = `${root}/${key}`
      const overview = `${root}/${key}/overview`
      const hasOverview = paths.some((path) => path === overview)
      const hasExact = paths.some((path) => path === explicit)

      return {
        key,
        path: hasOverview
          ? overview
          : hasExact
            ? explicit
            : paths.slice().sort()[0] || explicit,
      }
    })
    .sort((a, b) => a.key.localeCompare(b.key))
}

export function toConsoleScopeLabel(key: unknown) {
  return String(key || '')
    .split(/[-_]+/)
    .filter(Boolean)
    .map((part) => part[0]?.toUpperCase() + part.slice(1))
    .join(' ')
}
