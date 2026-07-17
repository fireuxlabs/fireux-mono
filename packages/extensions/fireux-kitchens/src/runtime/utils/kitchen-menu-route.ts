import {
  MenuRouteContexts,
  type MenuRouteContext,
} from '../models/kitchen/menu/menu-context.model.ts'

export type MenuRouteScope =
  | { kind: 'root' }
  | { kind: 'tenant' }
  | { kind: 'directory', kitchenSlug: string }

export type MenuRouteTarget = {
  menuId: string
  context: MenuRouteContext
}

export type MenuRouteProjection = 'browse' | 'order' | 'diagnostic'

const text = (value: unknown) => String(value ?? '').trim()
const segment = (value: unknown) => encodeURIComponent(text(value))
const contextSet = new Set<string>(MenuRouteContexts)

export const rootMenuRouteScope = (): MenuRouteScope => ({ kind: 'root' })

export const tenantMenuRouteScope = (): MenuRouteScope => ({ kind: 'tenant' })

export const directoryMenuRouteScope = (
  kitchenSlug: unknown
): MenuRouteScope => ({
  kind: 'directory',
  kitchenSlug: text(kitchenSlug),
})

export function menuRouteIndexPath(scope: MenuRouteScope) {
  if (scope.kind === 'root' || scope.kind === 'tenant') return '/menus'

  const kitchenSlug = segment(scope.kitchenSlug)
  return kitchenSlug ? `/kitchens/${kitchenSlug}/menus` : ''
}

export const menuContextualMenuId = (
  menuId: unknown,
  context: MenuRouteContext = 'generic'
) => {
  const id = text(menuId)

  return !id || context === 'generic' ? id : `${id}.${context}`
}

export function menuRoutePath(options: {
  scope: MenuRouteScope
  menuId: unknown
  context?: MenuRouteContext
}) {
  const menuId = segment(menuContextualMenuId(options.menuId, options.context))
  if (!menuId) return ''
  if (options.scope.kind === 'tenant') return `/${menuId}`

  const indexPath = menuRouteIndexPath(options.scope)

  return indexPath ? `${indexPath}/${menuId}` : ''
}

export function menuRouteQrPath(options: {
  scope: MenuRouteScope
  menuId: unknown
  context?: MenuRouteContext
}) {
  const menuPath = menuRoutePath(options)
  return menuPath ? `${menuPath}/qr` : ''
}

export function menuRouteProjection(
  context: MenuRouteContext
): MenuRouteProjection {
  if (context === 'generic') return 'browse'
  if (context === 'collection') return 'order'

  return 'diagnostic'
}

export function parseMenuRouteTarget(value: unknown): MenuRouteTarget {
  const rawMenuId = text(value)
  const [contextCandidate, ...menuParts] = rawMenuId
    .split('.')
    .reverse()
  const hasContextSuffix =
    contextSet.has(text(contextCandidate)) && menuParts.length > 0

  if (!hasContextSuffix) {
    return {
      menuId: rawMenuId,
      context: 'generic',
    }
  }

  return {
    menuId: menuParts.reverse().join('.'),
    context: contextCandidate as MenuRouteContext,
  }
}
