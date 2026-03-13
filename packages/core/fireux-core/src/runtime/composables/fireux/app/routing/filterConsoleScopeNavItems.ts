import type { NavItem } from '../../../../../types/nav'

export function filterConsoleScopeNavItems(items: NavItem[], routePath: string) {
  const match = String(routePath || '').trim().match(/^\/console\/([^/]+)\/create$/)
  if (!match) return items

  const scopeRoot = `/console/${match[1]}`
  const createPath = `${scopeRoot}/create`

  return items.filter((item) => {
    const path = String(item.to || '').trim().replace(/\/+$/, '')
    if (!path.startsWith(`${scopeRoot}/`)) return true
    return path === createPath
  })
}
