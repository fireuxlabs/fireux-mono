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
  routeKind: MenuChoiceInput['routeKind']
) => {
  const scope =
    routeKind === 'tenant-menu'
      ? tenantMenuRouteScope()
      : directoryMenuRouteScope(kitchenSlug)

  return menuRoutePath({
    scope,
    menuId,
    context: menuChoiceContextForOrderType(orderType),
  })
}
function menuChoices(input: {
  data: Record<string, unknown>
  kitchenOrdering: unknown
  menuId: string
  kitchenSlug: string
  currentMenuId: string
  routeKind?: MenuChoiceInput['routeKind']
}): MenuChoice[] {
  const ordering = readKitchenMenuOrdering(input.kitchenOrdering, input.menuId)
  const orderingEnabled = isMenuOrderingEnabled(ordering)
  const isCurrent = input.menuId === input.currentMenuId
  const choices: MenuChoice[] = []

  const menuSlug = readRecordString(input.data, 'slug')
  if (orderingEnabled && menuSlug) {
    ordering.order_types.forEach((orderType) => {
      const to = isCurrent
        ? ''
        : menuPath(input.kitchenSlug, menuSlug, orderType.type, input.routeKind)
      choices.push({
        value: `order:${input.menuId}:${orderType.type}`,
        label: kitchenOrderTypeLabel(orderType.type),
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
      kitchenOrdering: kitchen.data()?.ordering,
      menuId: row.id,
      kitchenSlug: input.kitchenSlug,
      currentMenuId: input.currentMenuId,
      routeKind: input.routeKind,
    })
  )
}
