import type { NavItem } from '../nav.types'

function normalizePath(value: unknown): string {
  return String(value || '').trim().replace(/\/+$/, '')
}

export function filterConsoleScopeNavItems(items: NavItem[], routePath: string) {
  const currentPath = normalizePath(routePath)
  if (currentPath === '/console') return []

  const scopeMatch = currentPath.match(/^\/console\/([^/]+)(?:\/.*)?$/)
  if (!scopeMatch) return items

  const scopeRoot = `/console/${scopeMatch[1]}`
  const createPath = `${scopeRoot}/create`
  const isScopeEntryRoute = currentPath === scopeRoot
  const isCreateRoute = currentPath === createPath

  return items.filter((item) => {
    const path = normalizePath(item.to)
    if (!path.startsWith('/console/')) return true
    if (path !== scopeRoot && !path.startsWith(`${scopeRoot}/`)) return false
    if (isScopeEntryRoute) return false
    if (!isCreateRoute) return true
    return path === createPath
  })
}
