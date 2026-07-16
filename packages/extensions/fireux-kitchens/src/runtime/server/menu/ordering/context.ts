import { createError } from 'h3'
import {
  currentPublicMenuAppId,
  resolvePublicMenuTarget,
} from '../ownership/public-target.ts'
import type { MenuOrderFulfilmentPolicy } from '../../../models/kitchen/menu/menu.model.ts'
import type { WeekdayTimeWindowsConfig } from '../../../models/shared/weekday-time.model.ts'
import {
  directoryMenuRouteScope,
  rootMenuRouteScope,
  type MenuRouteScope,
} from '../../../utils/kitchen-menu-route.ts'

export type MenuOrderContext = {
  appId: string
  kitchenId: string
  kitchenPlaceId?: string
  kitchenSlug?: string
  kitchenName?: string
  currencyCode?: string
  menuId: string
  routeMenuId: string
  routeScope: MenuRouteScope
  menuData: Record<string, unknown>
  fulfilment?: MenuOrderFulfilmentPolicy
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

  return {
    appId: target.appId,
    kitchenId: target.kitchenId,
    kitchenPlaceId: text(target.scope.kitchenPlaceId) || target.kitchenId,
    kitchenSlug: target.kitchenSlug,
    kitchenName: text(target.scope.kitchenName),
    currencyCode: text(target.scope.currencyCode),
    menuId: target.sourceMenuId,
    routeMenuId: target.routeMenuId,
    routeScope: target.kind === 'directory-menu'
      ? directoryMenuRouteScope(target.kitchenSlug)
      : rootMenuRouteScope(),
    menuData: target.kind === 'root-doorway'
      ? target.sourceMenuData
      : target.menuData,
    fulfilment: target.scope.fulfilment,
    operationHours: target.scope.kitchen_operation_hours,
  }
}
