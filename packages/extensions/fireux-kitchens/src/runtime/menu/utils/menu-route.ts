import {
  MenuRouteContexts,
  type MenuRouteContext,
} from '../models/menu-context.model.ts'

export type MenuRouteScope =
  | { kind: 'root' }
  | { kind: 'tenant' }
  | { kind: 'directory'; kitchenSlug: string }

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

export function menuRouteIndexPath(
  scope: MenuRouteScope,
  context: 'generic' | 'collection' | 'delivery' = 'generic'
) {
  if (scope.kind === 'root' || scope.kind === 'tenant') return '/menus'

  const kitchenSlug = segment(scope.kitchenSlug)
  return kitchenSlug
    ? `/kitchens/${kitchenSlug}/menu${context === 'generic' ? '' : `.${context}`}`
    : ''
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
  offeringId?: string
}) {
  const menuId = segment(menuContextualMenuId(options.menuId, options.context))
  if (!menuId) return ''
  const query = options.offeringId
    ? `?offering=${encodeURIComponent(options.offeringId)}`
    : ''
  if (options.scope.kind === 'tenant') return `/${menuId}${query}`

  // Individual Menu destinations are independent of the venue's Menu entrance.
  const indexPath =
    options.scope.kind === 'directory'
      ? text(options.scope.kitchenSlug)
        ? `/kitchens/${segment(options.scope.kitchenSlug)}/menus`
        : ''
      : menuRouteIndexPath(options.scope)

  return indexPath ? `${indexPath}/${menuId}${query}` : ''
}

export function menuCanonicalPath(options: {
  scope: MenuRouteScope
  menuId: unknown
  context?: MenuRouteContext
  offeringId?: string
  sourceKitchenSlug?: unknown
  sourceMenuSlug?: unknown
}) {
  const sourceKitchenSlug = text(options.sourceKitchenSlug)
  const sourceMenuSlug = text(options.sourceMenuSlug)

  if (options.scope.kind !== 'tenant' && sourceKitchenSlug && sourceMenuSlug) {
    return menuRoutePath({
      scope: directoryMenuRouteScope(sourceKitchenSlug),
      menuId: sourceMenuSlug,
      context: options.context,
      offeringId: options.offeringId,
    })
  }

  return menuRoutePath({
    scope: options.scope,
    menuId: options.menuId,
    context: options.context,
    offeringId: options.offeringId,
  })
}

export function menuRouteQrPath(options: {
  scope: MenuRouteScope
  menuId: unknown
  context?: MenuRouteContext
  offeringId?: string
}) {
  const menuPath = menuRoutePath({ ...options, offeringId: undefined })
  const query = options.offeringId
    ? `?offering=${encodeURIComponent(options.offeringId)}`
    : ''
  return menuPath ? `${menuPath}/qr${query}` : ''
}

export function menuRouteProjection(
  context: MenuRouteContext
): MenuRouteProjection {
  if (context === 'generic') return 'browse'
  if (
    context === 'delivery' ||
    context === 'collection' ||
    context === 'table' ||
    context === 'kiosk' ||
    context === 'pre_order'
  )
    return 'order'

  return 'diagnostic'
}

export function parseMenuRouteTarget(value: unknown): MenuRouteTarget {
  const rawMenuId = text(value)
  const [contextCandidate, ...menuParts] = rawMenuId.split('.').reverse()
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
