import type { Firestore } from 'firebase-admin/firestore'
import { readRecordString } from 'fireux-core/runtime/server/utils/records/read.ts'
import type {
  MenuPublicChoice,
  MenuView,
} from '../../../../models/kitchen/menu/menu.model.ts'
import { menuOrderTypeLabel } from '../../../../utils/menu-ordering-ui.ts'
import {
  isMenuOrderingEnabled,
  readMenuOrderingConfig,
} from '../ordering/config.ts'
import { readMenuViews } from './view.ts'

type PublicChoiceInput = {
  appId: string
  kitchenId: string
  kitchenSlug: string
  currentMenuId: string
}

const numberValue = (value: unknown) => {
  const number = Number(value)

  return Number.isFinite(number) ? number : 0
}
const menuPath = (kitchenSlug: string, menuId: string) =>
  `/kitchens/${encodeURIComponent(kitchenSlug)}/menus/${encodeURIComponent(menuId)}`
const publicViewsForMenu = (
  data: Record<string, unknown>,
  orderingEnabled: boolean
): MenuView[] => {
  const views = readMenuViews(data, orderingEnabled)

  return views.length ? views : ['browse']
}

function menuChoices(input: {
  data: Record<string, unknown>
  menuId: string
  kitchenSlug: string
  currentMenuId: string
}): MenuPublicChoice[] {
  const ordering = readMenuOrderingConfig(input.data)
  const orderingEnabled = isMenuOrderingEnabled(ordering)
  const views = publicViewsForMenu(input.data, orderingEnabled)
  const isCurrent = input.menuId === input.currentMenuId
  const to = isCurrent ? '' : menuPath(input.kitchenSlug, input.menuId)
  const name = readRecordString(input.data, 'name') || input.menuId
  const publicChoiceLabel =
    readRecordString(input.data, 'public_choice_label') ||
    (orderingEnabled ? 'Browse' : name)
  const publicMessage = readRecordString(input.data, 'public_message')
  const choices: MenuPublicChoice[] = []

  if (views.includes('browse')) {
    choices.push({
      value: `browse:${input.menuId}`,
      label: publicChoiceLabel,
      view: 'browse',
      menu_id: input.menuId,
      ...(to ? { to } : {}),
      ...(publicMessage ? { message: publicMessage } : {}),
    })
  }

  if (views.includes('order') && orderingEnabled) {
    ordering.order_types.forEach((orderType) => {
      choices.push({
        value: `order:${input.menuId}:${orderType.type}`,
        label: menuOrderTypeLabel(orderType.type),
        view: 'order',
        menu_id: input.menuId,
        order_type: orderType.type,
        ...(to ? { to } : {}),
        ...(orderType.message ? { message: orderType.message } : {}),
      })
    })
  }

  return choices
}

export async function readKitchenMenuPublicChoices(
  db: Firestore,
  input: PublicChoiceInput
): Promise<MenuPublicChoice[]> {
  if (!input.appId || !input.kitchenId || !input.kitchenSlug || !input.currentMenuId) {
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
    })
  )
}
