import type { Dish } from '../models/dish.model'
import type { Menu } from '../../menu/models/menu.model'
import type { KitchenPromotion } from '../models/promotion.model'

export type FoodSummary = { status: string; flags: string[] }
const validPrice = (value: unknown) =>
  typeof value === 'number' && Number.isFinite(value) && value >= 0
const missingName = (row: { name?: string }) => !row.name?.trim()
const countFlag = (count: number, message: string) =>
  count ? [`${count} ${message}`] : []

export function foodItemSummary(items: Partial<Dish>[]): FoodSummary {
  return {
    status: items.length ? `${items.length} items` : 'No items yet',
    flags: [
      ...countFlag(items.filter(missingName).length, 'missing a name'),
      ...countFlag(
        items.filter(
          (item) =>
            !validPrice(item.price)
        ).length,
        'need a price'
      ),
    ],
  }
}

export function foodMenuSummary(menus: Menu[]): FoodSummary {
  const regular = menus.filter(
    (menu) => menu.schedule !== 'daily' && menu.status !== 'archived'
  )
  const published = regular.filter((menu) => menu.status === 'published').length
  return {
    status: regular.length
      ? `${published} published · ${regular.length - published} draft`
      : 'No menus yet',
    flags: [
      ...countFlag(regular.filter(missingName).length, 'missing a name'),
      ...countFlag(
        regular.filter(
          (menu) => menu.format === 'document' && !menu.doc?.url?.trim()
        ).length,
        'missing a document'
      ),
    ],
  }
}

export function foodPromotionSummary(
  promotions: KitchenPromotion[],
  dishes: Partial<Dish>[]
): FoodSummary {
  const active = promotions.filter(
    (promotion) => promotion.status === 'active'
  ).length
  const dishIds = new Set(dishes.map((dish) => dish.id))
  const incomplete = promotions.filter((promotion) => {
    if (missingName(promotion) || !promotion.days?.length) return true
    if ('groups' in promotion)
      return (
        !validPrice(promotion.price) ||
        !promotion.groups?.length ||
        promotion.groups.some(
          (group) =>
            !group.name?.trim() ||
            !Number.isInteger(group.choose) ||
            group.choose < 1 ||
            group.dishes.length < group.choose ||
            group.dishes.some(
              (choice) =>
                !dishIds.has(choice.dishId) || !validPrice(choice.supplement)
            )
        )
      )
    return (
      !promotion.dishes?.length ||
      promotion.dishes.some(
        (dish) => !dishIds.has(dish.dishId) || !validPrice(dish.price)
      )
    )
  }).length
  return {
    status: promotions.length
      ? `${active} active · ${promotions.length - active} paused`
      : 'No promotions',
    flags: countFlag(
      incomplete,
      'need a name, serving days or complete dish choices'
    ),
  }
}
