import type { Firestore } from 'firebase-admin/firestore'
import { readRecordString } from 'fireux-core/runtime/server/utils/records/read.ts'
import type {
  MenuChoice,
} from '../../../models/kitchen/menu/menu.model.ts'
import { menuOrderTypeLabel } from '../../../utils/menu-ordering-ui.ts'
import {
  menuChoiceContextForOrderType,
  menuContextualMenuId,
} from '../../../utils/menu-context.ts'
import {
  isMenuOrderingEnabled,
  readMenuOrderingConfig,
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
  const contextualMenuId = menuContextualMenuId(
    menuId,
    menuChoiceContextForOrderType(orderType)
  )

  if (routeKind === 'tenant-menu') {
    return `/menus/${encodeURIComponent(contextualMenuId)}`
  }

  return `/kitchens/${encodeURIComponent(kitchenSlug)}/menus/${encodeURIComponent(contextualMenuId)}`
}
function menuChoices(input: {
  data: Record<string, unknown>
  menuId: string
  kitchenSlug: string
  currentMenuId: string
  routeKind?: MenuChoiceInput['routeKind']
}): MenuChoice[] {
  const ordering = readMenuOrderingConfig(input.data)
  const orderingEnabled = isMenuOrderingEnabled(ordering)
  const isCurrent = input.menuId === input.currentMenuId
  const choices: MenuChoice[] = []

  if (orderingEnabled) {
    ordering.order_types.forEach((orderType) => {
      const to = isCurrent
        ? ''
        : menuPath(
            input.kitchenSlug,
            input.menuId,
            orderType.type,
            input.routeKind
          )
      choices.push({
        value: `order:${input.menuId}:${orderType.type}`,
        label: menuOrderTypeLabel(orderType.type),
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

  const snap = await db
    .collection(`apps/${input.appId}/kitchens/${input.kitchenId}/menus`)
    .get()
  const rows = snap.docs
    .map((doc) => ({
      id: doc.id,
      data: doc.data() || {},
    }))
    .filter((row) => readRecordString(row.data, 'status') === 'published')
    .sort((left, right) =>
      numberValue(left.data.sort_order) - numberValue(right.data.sort_order) ||
      (readRecordString(left.data, 'name') || left.id)
        .localeCompare(readRecordString(right.data, 'name') || right.id)
    )

  return rows.flatMap((row) =>
    menuChoices({
      data: row.data,
      menuId: row.id,
      kitchenSlug: input.kitchenSlug,
      currentMenuId: input.currentMenuId,
      routeKind: input.routeKind,
    })
  )
}
