type MenuReadObserver = {
  document: (
    target: any,
    id: string,
    data: Record<string, unknown> | null | undefined
  ) => void
  collection: (
    target: any,
    records: Array<{ id: string; data: Record<string, unknown> }>
  ) => void
}
import {
  serverKitchenDishesTarget,
  serverKitchenMenuSectionsTarget,
  serverKitchenMenuItemsTarget,
} from 'fireux-core/runtime/utils/firestore-mutations/targets'
import { serverKitchenSellablesTarget } from '../../../kitchen/server/sellables/target'
// Concurrent edit — 2026-07-22 01:58 CEST — Dish/MenuItem boundary: project menu images only from Dish food truth.
import type { Firestore } from 'firebase-admin/firestore'
import { projectSellable } from '../../../kitchen/utils/sellable'
import {
  normalizeDishDealFlag,
  readDishItemKind,
} from '../../../kitchen/utils/dish.ts'
import {
  normalizeMenuItemAddOns,
  normalizeMenuItemPriceOptions,
} from '../../utils/menu-item.ts'
import {
  readRecord,
  readRecordString,
} from 'fireux-core/runtime/server/utils/records/read'

const text = (value: unknown) => String(value ?? '').trim()
const numberValue = (value: unknown) => {
  const number = Number(value)
  return Number.isFinite(number) ? number : 0
}
const active = (data: Record<string, unknown>) =>
  readRecordString(data, 'status') !== 'archived'
const sortOrder = (data: Record<string, unknown>) =>
  numberValue(data.sort_order)
export async function readKitchenMenuSections(
  db: Firestore,
  input: {
    appId: string
    kitchenId: string
    menuId: string
    date?: string
    observe?: MenuReadObserver
  }
) {
  const basePath = `kitchens/${input.kitchenId}`
  const dishesSnap = await db.collection(`${basePath}/dishes`).get()
  input.observe?.collection(
    serverKitchenDishesTarget(input.kitchenId),
    dishesSnap.docs.map((doc) => ({ id: doc.id, data: doc.data() }))
  )
  const dishesById = new Map(
    dishesSnap.docs.map((doc) => [
      doc.id,
      readRecord({ id: doc.id, ...(doc.data() || {}) }),
    ])
  )
  const sellables = new Map<string, Promise<Record<string, unknown>>>()
  const commercial = (id: string, dishId: string) => {
    if (!id || id.includes('/') || id === '.' || id === '..')
      throw new Error('Invalid Menu sellable reference.')
    if (!sellables.has(id))
      sellables.set(
        id,
        db
          .doc(`${basePath}/sellables/${id}`)
          .get()
          .then((snapshot) => {
            input.observe?.document(
              serverKitchenSellablesTarget(input.kitchenId),
              id,
              snapshot.exists ? snapshot.data() : undefined
            )
            if (!snapshot.exists) throw new Error('Menu sellable is missing.')
            return snapshot.data()!
          })
      )
    return sellables
      .get(id)!
      .then((value) => projectSellable(id, value, dishId))
  }
  const sectionsSnap = await db
    .collection(`${basePath}/menus/${input.menuId}/sections`)
    .get()
  input.observe?.collection(
    serverKitchenMenuSectionsTarget(input.kitchenId, input.menuId),
    sectionsSnap.docs.map((doc) => ({ id: doc.id, data: doc.data() }))
  )
  const sections = await Promise.all(
    sectionsSnap.docs
      .map((doc) => readRecord({ id: doc.id, ...(doc.data() || {}) }))
      .filter(active)
      .filter((section) => !input.date || section.date === input.date)
      .sort((left, right) => sortOrder(left) - sortOrder(right))
      .map(async (section) => {
        const sectionId = text(section.id)
        const itemsSnap = await db
          .collection(
            `${basePath}/menus/${input.menuId}/sections/${sectionId}/items`
          )
          .get()
        input.observe?.collection(
          serverKitchenMenuItemsTarget(
            input.kitchenId,
            input.menuId,
            sectionId
          ),
          itemsSnap.docs.map((doc) => ({ id: doc.id, data: doc.data() }))
        )
        const items = await Promise.all(
          itemsSnap.docs
            .map((doc) => readRecord({ id: doc.id, ...(doc.data() || {}) }))
            .filter(active)
            .sort((left, right) => sortOrder(left) - sortOrder(right))
            .map(async (item) => {
              const dishId = readRecordString(item, 'dish_id')
              const dish = dishesById.get(dishId) ?? null
              if (item.sellable_id && !dish)
                throw new Error('Menu sellable Dish is missing.')

              return {
                id: text(item.id),
                dish_id: dishId,
                item_kind: readDishItemKind(dish?.item_kind) || 'food',
                is_deal: normalizeDishDealFlag(dish?.is_deal),
                name: readRecordString(dish || {}, 'name') || dishId,
                description: readRecordString(dish || {}, 'description'),
                image_url: readRecordString(dish || {}, 'image'),
                price: numberValue(item.price),
                priceOptions: normalizeMenuItemPriceOptions(item.price_options),
                addOns: normalizeMenuItemAddOns(item.add_ons),
                ...(item.sellable_id
                  ? await commercial(text(item.sellable_id), dishId)
                  : {}),
              }
            })
        )

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
