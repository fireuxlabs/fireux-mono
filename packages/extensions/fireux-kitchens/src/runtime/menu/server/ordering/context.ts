// Concurrent edit — 2026-07-19 17:02 CEST — Delivery pass: carry Kitchen fulfilment capability into canonical Menu order context.
// Concurrent edit — 2026-07-20 21:19 CEST — Place-root authority pass: fail ordering closed without an explicit Kitchen Place reference.
import { createError } from 'h3'
import { currentMenuAppId } from '../ownership/app-scope.ts'
import type { MenuTarget } from '../ownership/target-types'
import { resolveMenuTarget } from '../ownership/target.ts'
import type { KitchenFulfilment } from '../../../kitchen/models/fulfilment.model.ts'
import {
  directoryMenuRouteScope,
  rootMenuRouteScope,
  tenantMenuRouteScope,
  type MenuRouteScope,
} from '../../../kitchen/utils/kitchen-menu-route.ts'

export type MenuOrderContext = {
  appId: string
  kitchenId: string
  kitchenPlaceId: string
  kitchenSlug?: string
  kitchenName?: string
  currencyCode?: string
  menuId: string
  routeMenuId: string
  routeScope: MenuRouteScope
  kitchenServices: unknown
  menuData: Record<string, unknown>
  fulfilment?: KitchenFulfilment
}

const text = (value: unknown) => String(value ?? '').trim()

export const currentMenuOrderAppId = currentMenuAppId

export const readMenuOrderContext = async (
  menuId: string,
  kitchenSlug: string,
  onResolved?: (target: MenuTarget) => void
): Promise<MenuOrderContext> => {
  const target = await resolveMenuTarget(menuId, kitchenSlug)
  if (!target.appId || !target.kitchenId || !target.sourceMenuId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'This menu cannot accept orders yet.',
    })
  }

  onResolved?.(target)
  const kitchenPlaceId = text(target.scope.kitchenPlaceId)
  if (!kitchenPlaceId) {
    throw createError({
      statusCode: 400,
      statusMessage:
        'This Kitchen must be linked to a Place before accepting orders.',
    })
  }
  const kitchenName = text(target.scope.kitchenName)
  const currencyCode = text(target.scope.currencyCode)
  return {
    kitchenServices: target.scope.kitchen_services,
    appId: target.appId,
    kitchenId: target.kitchenId,
    kitchenPlaceId,
    ...(target.kitchenSlug ? { kitchenSlug: target.kitchenSlug } : {}),
    ...(kitchenName ? { kitchenName } : {}),
    ...(currencyCode ? { currencyCode } : {}),
    menuId: target.sourceMenuId,
    routeMenuId: target.routeMenuId,
    routeScope:
      target.kind === 'directory-menu'
        ? directoryMenuRouteScope(target.kitchenSlug)
        : target.kind === 'tenant-menu'
          ? tenantMenuRouteScope()
          : rootMenuRouteScope(),
    menuData:
      target.kind === 'root-doorway' ? target.sourceMenuData : target.menuData,
    ...(target.scope.fulfilment ? { fulfilment: target.scope.fulfilment } : {}),
  }
}
