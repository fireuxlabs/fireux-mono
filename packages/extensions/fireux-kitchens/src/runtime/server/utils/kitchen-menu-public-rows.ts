import type { Firestore } from 'firebase-admin/firestore'
import {
  normalizeMenuItemPriceOptions,
} from '../../models/menu/menu-item.model'
import {
  readRecord,
  readRecordString,
} from 'fireux-core/runtime/server/utils/records/read.ts'

const text = (value: unknown) => String(value ?? '').trim()
const numberValue = (value: unknown) => {
  const number = Number(value)
  return Number.isFinite(number) ? number : 0
}
const active = (data: Record<string, unknown>) =>
  readRecordString(data, 'status') !== 'archived'
const sortOrder = (data: Record<string, unknown>) =>
  numberValue(data.sort_order)

export async function readKitchenMenuPublicRows(
  db: Firestore,
  input: {
    appId: string
    kitchenId: string
    menuId: string
  }
) {
  const basePath = `apps/${input.appId}/kitchens/${input.kitchenId}`
  const dishesSnap = await db.collection(`${basePath}/dishes`).get()
  const dishesById = new Map(
    dishesSnap.docs.map((doc) => [
      doc.id,
      readRecord({ id: doc.id, ...(doc.data() || {}) }),
    ])
  )
  const sectionsSnap = await db
    .collection(`${basePath}/menus/${input.menuId}/sections`)
    .get()
  const sections = await Promise.all(
    sectionsSnap.docs
      .map((doc) => readRecord({ id: doc.id, ...(doc.data() || {}) }))
      .filter(active)
      .sort((left, right) => sortOrder(left) - sortOrder(right))
      .map(async (section) => {
        const sectionId = text(section.id)
        const itemsSnap = await db
          .collection(`${basePath}/menus/${input.menuId}/sections/${sectionId}/items`)
          .get()
        const items = itemsSnap.docs
          .map((doc) => readRecord({ id: doc.id, ...(doc.data() || {}) }))
          .filter(active)
          .sort((left, right) => sortOrder(left) - sortOrder(right))
          .map((item) => {
            const dishId = readRecordString(item, 'dish_id')
            const dish = dishesById.get(dishId) ?? null

            return {
              id: text(item.id),
              name: readRecordString(dish || {}, 'name') || dishId,
              description: readRecordString(dish || {}, 'description'),
              price: numberValue(item.price),
              priceOptions: normalizeMenuItemPriceOptions(item.price_options),
            }
          })

        return {
          id: sectionId,
          label: readRecordString(section, 'label'),
          description: readRecordString(section, 'description'),
          items,
        }
      })
  )

  return sections
}
