import type { RouteRecordNormalized } from 'vue-router'

export type ConsoleRouteLike = Pick<RouteRecordNormalized, 'path'>

export type ConsoleChildRoute = {
  key: string
  path: string
}

export const CONSOLE_ROOT = '/console'

export function isConsoleRoutePath(path: string) {
  const normalizedPath = path.trim()
  return normalizedPath === CONSOLE_ROOT || normalizedPath.startsWith(`${CONSOLE_ROOT}/`)
}

export function getConsoleScopeFromPath(path: string) {
  const match = path.trim().match(/^\/console\/([^/]+)/)
  if (!match) return null

  const scope = match[1].trim().toLowerCase()
  if (!scope) return null

  return scope
}

export function discoverConsoleChildren(routes: ConsoleRouteLike[]): ConsoleChildRoute[] {
  const keys = routes
    .map((route) => route.path.trim())
    .filter((path) => path.endsWith('/overview'))
    .map((path) => getConsoleScopeFromPath(path))
    .filter((scope): scope is string => Boolean(scope))

  return Array.from(new Set(keys))
    .map((key) => ({
      key,
      path: `${CONSOLE_ROOT}/${key}`,
    }))
    .sort((a, b) => a.key.localeCompare(b.key))
}

export function toConsoleScopeLabel(key: string) {
  return key
    .split(/[-_]+/)
    .filter(Boolean)
    .map((part) => part[0]?.toUpperCase() + part.slice(1))
    .join(' ')
}
