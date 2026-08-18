// Concurrent edit — 2026-07-19 17:02 CEST — Delivery pass: carry Kitchen fulfilment capability into canonical Menu order context.
// Concurrent edit — 2026-07-20 21:19 CEST — Place-root authority pass: fail ordering closed without an explicit Kitchen Place reference.
import { createError } from 'h3'
import {
  currentPublicMenuAppId,
  resolvePublicMenuTarget,
} from '../ownership/public-target.ts'
import type { KitchenFulfilmentConfig } from '../../../kitchen/models/kitchen.model.ts'
import type { WeekdayTimeWindowsConfig } from '../../../models/shared/weekday-time.model.ts'
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
  menuData: Record<string, unknown>
  fulfilment?: KitchenFulfilmentConfig
  operationHours?: WeekdayTimeWindowsConfig
}

const text = (value: unknown) => String(value ?? '').trim()

export const currentMenuOrderAppId = currentPublicMenuAppId

export const readMenuOrderContext = async (
  menuId: string,
  kitchenSlug: string
): Promise<MenuOrderContext> => {
  const target = await resolvePublicMenuTarget(menuId, kitchenSlug)
  if (!target.appId || !target.kitchenId || !target.sourceMenuId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'This menu cannot accept orders yet.',
    })
  }

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
    ...(target.scope.kitchen_operation_hours
      ? { operationHours: target.scope.kitchen_operation_hours }
      : {}),
  }
}
