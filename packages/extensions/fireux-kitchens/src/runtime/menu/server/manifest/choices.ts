import { readKitchenServices } from '../../../kitchen/utils/kitchen-services'
import type { Firestore } from 'firebase-admin/firestore'
import { readRecordString } from 'fireux-core/runtime/server/utils/records/read'
import type { MenuChoice } from '../../models/menu-ordering.model'
import { kitchenOrderTypeLabel } from '../../../kitchen/utils/kitchen-order-label'
import { menuChoiceContextForOrderType } from '../../utils/menu-context.ts'
import {
  directoryMenuRouteScope,
  menuRoutePath,
  tenantMenuRouteScope,
} from '../../../kitchen/utils/kitchen-menu-route.ts'
import {
  isMenuOrderingEnabled,
  readKitchenMenuOrdering,
} from '../ordering/config.ts'

type MenuChoiceInput = {
  appId: string
  kitchenId: string
  kitchenSlug: string
  currentMenuId: string
  routeKind?: 'tenant-menu' | 'directory-menu'
}

const numberValue = (value: unknown) => {
  const number = Number(value)

  return Number.isFinite(number) ? number : 0
}
const menuPath = (
  kitchenSlug: string,
  menuId: string,
  orderType: Parameters<typeof menuChoiceContextForOrderType>[0],
  routeKind: MenuChoiceInput['routeKind'],
  serviceId: string
) => {
  const scope =
    routeKind === 'tenant-menu'
      ? tenantMenuRouteScope()
      : directoryMenuRouteScope(kitchenSlug)

  return menuRoutePath({
    scope,
    menuId,
    context: menuChoiceContextForOrderType(orderType),
    serviceId,
  })
}
function menuChoices(input: {
  data: Record<string, unknown>
  kitchenServices: unknown
  menuId: string
  kitchenSlug: string
  currentMenuId: string
  routeKind?: MenuChoiceInput['routeKind']
}): MenuChoice[] {
  const ordering = readKitchenMenuOrdering(input.kitchenServices, input.menuId)
  const orderingEnabled = isMenuOrderingEnabled(ordering)
  const choices: MenuChoice[] = []

  const menuSlug = readRecordString(input.data, 'slug')
  if (menuSlug) {
    for (const service of readKitchenServices(input.kitchenServices)) {
      if (
        !service.enabled ||
        !service.menu_ids.includes(input.menuId) ||
        !service.interactions.some(
          (interaction) => interaction.type === 'browse' && interaction.enabled
        )
      )
        continue
      const scope =
        input.routeKind === 'tenant-menu'
          ? tenantMenuRouteScope()
          : directoryMenuRouteScope(input.kitchenSlug)
      choices.push({
        value: `browse:${input.menuId}:${service.id}`,
        label: `${service.name} · Browse`,
        menu_id: input.menuId,
        kitchen_service_id: service.id,
        kitchen_service_name: service.name,
        to: menuRoutePath({ scope, menuId: menuSlug, serviceId: service.id }),
      })
    }
  }
  if (orderingEnabled && menuSlug) {
    ordering.order_types.forEach((orderType) => {
      if (
        orderType.type === 'dine_in' &&
        orderType.table_channels?.table_qr === false
      )
        return
      const to = menuPath(
        input.kitchenSlug,
        menuSlug,
        orderType.type,
        input.routeKind,
        orderType.kitchen_service_id
      )
      choices.push({
        value: `order:${input.menuId}:${orderType.kitchen_service_id}:${orderType.type}`,
        kitchen_service_id: orderType.kitchen_service_id,
        kitchen_service_name: orderType.kitchen_service_name,
        label: `${orderType.kitchen_service_name} · ${kitchenOrderTypeLabel(orderType.type)}`,
        menu_id: input.menuId,
        order_type: orderType.type,
        ...(to ? { to } : {}),
        ...(orderType.message ? { message: orderType.message } : {}),
      })
    })
  }

  return choices
}

export async function readKitchenMenuChoices(
  db: Firestore,
  input: MenuChoiceInput
): Promise<MenuChoice[]> {
  if (
    !input.appId ||
    !input.kitchenId ||
    !input.currentMenuId ||
    (input.routeKind !== 'tenant-menu' && !input.kitchenSlug)
  ) {
    return []
  }

  const kitchen = await db.doc(`kitchens/${input.kitchenId}`).get()
  const snap = await db.collection(`kitchens/${input.kitchenId}/menus`).get()
  const rows = snap.docs
    .map((doc) => ({
      id: doc.id,
      data: doc.data() || {},
    }))
    .filter((row) => readRecordString(row.data, 'status') === 'published')
    .sort(
      (left, right) =>
        numberValue(left.data.sort_order) -
          numberValue(right.data.sort_order) ||
        (readRecordString(left.data, 'name') || left.id).localeCompare(
          readRecordString(right.data, 'name') || right.id
        )
    )

  return rows.flatMap((row) =>
    menuChoices({
      data: row.data,
      kitchenServices: kitchen.data()?.services,
      menuId: row.id,
      kitchenSlug: input.kitchenSlug,
      currentMenuId: input.currentMenuId,
      routeKind: input.routeKind,
    })
  )
}
