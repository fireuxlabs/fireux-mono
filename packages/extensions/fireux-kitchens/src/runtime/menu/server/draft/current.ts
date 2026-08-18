import { getRuntimeFirestore } from 'fireux-core/runtime/server/utils/getRuntimeFirestore'
import { readString } from 'fireux-core/runtime/server/utils/records/read'
import {
  normalizeMenuItemAddOns,
  normalizeMenuItemPriceOptions,
} from '../../models/menu-item.model.ts'

const asRecord = (value: unknown): Record<string, unknown> =>
  value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {}

const numberValue = (value: unknown) => {
  const number = Number(value)
  return Number.isFinite(number) ? number : 0
}

const menuRow = (menu: Record<string, unknown>, menuId: string) => ({
  id: readString(menu.id) || menuId,
  name: readString(menu.name),
  description: readString(menu.description),
  status: readString(menu.status),
  kitchen_id: readString(menu.kitchen_id),
})

const sectionRow = (section: Record<string, unknown>, sectionId: string) => ({
  id: readString(section.id) || sectionId,
  label: readString(section.label),
  description: readString(section.description),
  status: readString(section.status),
  sort_order: numberValue(section.sort_order),
})

const itemRow = (
  item: Record<string, unknown>,
  itemId: string,
  dish: Record<string, unknown> | null
) => ({
  id: readString(item.id) || itemId,
  dish_id: readString(item.dish_id),
  name: readString(dish?.name),
  description: readString(dish?.description),
  price: numberValue(item.price),
  add_ons: normalizeMenuItemAddOns(item.add_ons),
  price_options: normalizeMenuItemPriceOptions(item.price_options),
  status: readString(item.status),
  sort_order: numberValue(item.sort_order),
})

const sortByOrder = <T extends { sort_order: number }>(left: T, right: T) =>
  left.sort_order - right.sort_order

const active = (entry: { status: string }) => entry.status !== 'archived'

export async function readKitchenMenuCurrentShape(
  basePath: string,
  menuId: string
) {
  const db = getRuntimeFirestore()
  const menuRef = db.doc(`${basePath}/menus/${menuId}`)
  const menuSnap = await menuRef.get()

  if (!menuSnap.exists) {
    return {
      menu: menuRow({ status: 'missing' }, menuId),
      sections: [],
    }
  }

  const dishesSnap = await db.collection(`${basePath}/dishes`).get()
  const dishesById = new Map(
    dishesSnap.docs.map((doc) => [
      doc.id,
      asRecord({ ...doc.data(), id: doc.id }),
    ])
  )
  const sectionsSnap = await menuRef.collection('sections').get()
  const sections = await Promise.all(
    sectionsSnap.docs.map(async (sectionDoc) => {
      const section = sectionRow(sectionDoc.data(), sectionDoc.id)
      const itemsSnap = await sectionDoc.ref.collection('items').get()
      const items = itemsSnap.docs
        .map((itemDoc) => {
          const item = asRecord({ ...itemDoc.data(), id: itemDoc.id })
          return itemRow(
            item,
            itemDoc.id,
            dishesById.get(readString(item.dish_id)) ?? null
          )
        })
        .filter(active)
        .sort(sortByOrder)

      return {
        ...section,
        items,
      }
    })
  )

  return {
    menu: menuRow(menuSnap.data() || {}, menuSnap.id),
    sections: sections.filter(active).sort(sortByOrder),
  }
}

export type KitchenMenuCurrentShape = Awaited<
  ReturnType<typeof readKitchenMenuCurrentShape>
>
