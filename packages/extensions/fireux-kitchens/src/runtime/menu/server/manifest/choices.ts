import type { KitchenOffering } from '../../../kitchen/models/offering.model'
import { readKitchenOfferings } from '../../../kitchen/server/offerings/read'
import { normalizeKitchenOfferings } from '../../../kitchen/utils/offering-policy'
import type { Firestore } from 'firebase-admin/firestore'
import { readRecordString } from 'fireux-core/runtime/server/utils/records/read'
import type { MenuChoice } from '../../models/menu-ordering.model'
import { kitchenOrderTypeLabel } from '../../../kitchen/utils/kitchen-order-label'
import { menuChoiceContextForOrderType } from '../../utils/menu-context.ts'
import {
  directoryMenuRouteScope,
  menuRoutePath,
  tenantMenuRouteScope,
} from '../../utils/menu-route.ts'
import {
  isMenuOrderingEnabled,
  readKitchenMenuOrdering,
} from '../offerings/projection.ts'

type MenuChoiceInput = {
  offerings?: KitchenOffering[]
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
  offeringId: string
) => {
  const scope =
    routeKind === 'tenant-menu'
      ? tenantMenuRouteScope()
      : directoryMenuRouteScope(kitchenSlug)

  return menuRoutePath({
    scope,
    menuId,
    context: menuChoiceContextForOrderType(orderType),
    offeringId,
  })
}
function menuChoices(input: {
  data: Record<string, unknown>
  kitchenOfferings: unknown
  menuId: string
  kitchenSlug: string
  currentMenuId: string
  routeKind?: MenuChoiceInput['routeKind']
}): MenuChoice[] {
  const ordering = readKitchenMenuOrdering(input.kitchenOfferings, input.menuId)
  const orderingEnabled =
    input.data.schedule !== 'daily' && isMenuOrderingEnabled(ordering)
  const choices: MenuChoice[] = []

  const menuSlug = readRecordString(input.data, 'slug')
  if (menuSlug) {
    for (const offering of normalizeKitchenOfferings(input.kitchenOfferings)) {
      if (
        !offering.enabled ||
        !offering.menu_ids.includes(input.menuId) ||
        !offering.interactions.some(
          (interaction) => interaction.type === 'browse' && interaction.enabled
        )
      )
        continue
      const scope =
        input.routeKind === 'tenant-menu'
          ? tenantMenuRouteScope()
          : directoryMenuRouteScope(input.kitchenSlug)
      choices.push({
        value: `browse:${input.menuId}:${offering.id}`,
        label: `${offering.name} · Browse`,
        menu_id: input.menuId,
        kitchen_offering_id: offering.id,
        kitchen_offering_name: offering.name,
        to: menuRoutePath({ scope, menuId: menuSlug, offeringId: offering.id }),
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
        orderType.kitchen_offering_id
      )
      choices.push({
        value: `order:${input.menuId}:${orderType.kitchen_offering_id}:${orderType.type}`,
        kitchen_offering_id: orderType.kitchen_offering_id,
        kitchen_offering_name: orderType.kitchen_offering_name,
        label: `${orderType.kitchen_offering_name} · ${kitchenOrderTypeLabel(orderType.type)}`,
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

  const offerings =
    input.offerings || (await readKitchenOfferings(db, input.kitchenId))
  const snap = await db.collection(`kitchens/${input.kitchenId}/menus`).get()
  const rows = snap.docs
    .map((doc) => ({
      id: doc.id,
      data: doc.data() || {},
    }))
    .filter(
      (row) =>
        readRecordString(row.data, 'status') === 'published' &&
        (row.data.audience === undefined || row.data.audience === 'public')
    )
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
      kitchenOfferings: offerings,
      menuId: row.id,
      kitchenSlug: input.kitchenSlug,
      currentMenuId: input.currentMenuId,
      routeKind: input.routeKind,
    })
  )
}
