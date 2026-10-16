import { normalizeKitchenPromotion } from '../../../kitchen/utils/promotions/pricing'
import { kitchenPromotionsTarget } from '../../../kitchen/server/promotions/target'
import { readDishPricing } from '../../../kitchen/utils/dish-pricing'
import {
  normalizeDishPriceOptions,
  normalizeDishAddOns,
} from '../../../kitchen/utils/dish-pricing'
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
// Concurrent edit — 2026-07-22 01:58 CEST — Dish/MenuItem boundary: project menu images only from Dish food truth.
import type { Firestore } from 'firebase-admin/firestore'
import { readDishItemKind } from '../../../kitchen/utils/dish.ts'
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
    currencyCode?: string
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
              const promotionId = readRecordString(item, 'promotion_id')
              if (promotionId) {
                if (item.dish_id || input.date)
                  throw new Error('Invalid meal-deal placement.')
                const snapshot = await db
                  .collection(`${basePath}/promotions`)
                  .doc(promotionId)
                  .get()
                const data = snapshot.data()
                input.observe?.document(
                  kitchenPromotionsTarget(input.kitchenId),
                  promotionId,
                  data
                )
                if (
                  !data ||
                  data.status !== 'active' ||
                  !Array.isArray(data.groups)
                )
                  return null
                const { name, status, currency, days, price, groups } = data
                const promotion = normalizeKitchenPromotion({
                  name,
                  status,
                  currency,
                  days,
                  price,
                  groups,
                })
                if (!('groups' in promotion)) return null
                if (
                  input.currencyCode &&
                  promotion.currency !== input.currencyCode
                )
                  throw new Error('Meal-deal currency must match the Kitchen.')
                if (
                  promotion.groups.some((group) =>
                    group.dishes.some((choice) => {
                      const dish = dishesById.get(choice.dishId)
                      return !dish || dish.status === 'archived'
                    })
                  )
                )
                  return null
                const publicGroups = promotion.groups.map((group) => ({
                  ...group,
                  dishes: group.dishes.map((choice) => {
                    const dish = dishesById.get(choice.dishId)
                    return {
                      ...choice,
                      name:
                        readRecordString(dish || {}, 'name') || choice.dishId,
                    }
                  }),
                }))
                return {
                  id: text(item.id),
                  name: promotion.name,
                  price: promotion.price,
                  mealDeal: {
                    promotionId,
                    days: promotion.days,
                    timezone: '',
                    groups: publicGroups,
                  },
                  priceOptions: [],
                  addOns: [],
                }
              }
              const dishId = readRecordString(item, 'dish_id')
              const dish = dishesById.get(dishId) ?? null
              if (!dish || dish.status === 'archived') return null
              const pricing = readDishPricing(dish)

              return {
                id: text(item.id),
                dish_id: dishId,
                item_kind: readDishItemKind(dish?.item_kind) || 'food',
                name: readRecordString(dish || {}, 'name') || dishId,
                description: readRecordString(dish || {}, 'description'),
                image_url: readRecordString(dish || {}, 'image'),
                price: pricing.price,
                priceOptions: normalizeDishPriceOptions(pricing.price_options),
                addOns: normalizeDishAddOns(pricing.add_ons),
              }
            })
        )

        return {
          id: sectionId,
          label: readRecordString(section, 'label'),
          description: readRecordString(section, 'description'),
          items: items.filter((item) => item !== null),
        }
      })
  )

  return sections
}
