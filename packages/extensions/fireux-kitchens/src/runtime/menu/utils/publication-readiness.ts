import { readDishPricing } from '../../kitchen/utils/dish-pricing'
import {
  normalizeKitchenPromotion,
  promotionDishIds,
} from '../../kitchen/utils/promotions/pricing'

type RecordData = Record<string, unknown>
export type ReadinessSection = {
  id: string
  label?: string
  items: RecordData[]
}
export type MenuReadiness = {
  availableCount: number
  issues: Array<{
    sectionId: string
    section: string
    itemId: string
    name: string
    reason: string
  }>
}

/** Structural readiness, independent of today's serving window or ordering. */
export function menuPublicationReadiness(
  sections: ReadinessSection[],
  dishes: Map<string, RecordData>,
  promotions: Map<string, RecordData>,
  currency = ''
): MenuReadiness {
  const result: MenuReadiness = { availableCount: 0, issues: [] }
  for (const section of sections)
    for (const item of section.items) {
      if (item.status === 'archived') continue
      const dish = dishes.get(String(item.dish_id || ''))
      const stored = promotions.get(String(item.promotion_id || ''))
      let reason = ''
      const name = String(
        (item.promotion_id ? stored?.name : dish?.name) ||
          item.promotion_id ||
          item.dish_id ||
          'Unavailable entry'
      )
      if (item.promotion_id) {
        if (item.dish_id)
          reason = 'Entry references both a Dish and a meal deal.'
        else if (!stored || !Array.isArray(stored.groups))
          reason = 'Meal deal is missing.'
        else if (stored.status !== 'active') reason = 'Meal deal is paused.'
        else {
          try {
            const { name, status, currency: code, days, price, groups } = stored
            const deal = normalizeKitchenPromotion({
              name,
              status,
              currency: code,
              days,
              price,
              groups,
            })
            if (currency && deal.currency !== currency)
              reason = 'Meal-deal currency does not match the Kitchen.'
            else if (
              promotionDishIds(deal).some(
                (id) => !dishes.has(id) || dishes.get(id)?.status === 'archived'
              )
            )
              reason = 'Meal deal includes an unavailable Dish.'
          } catch {
            reason = 'Meal deal is incomplete.'
          }
        }
      } else if (!dish) reason = 'Dish is missing.'
      else if (dish.status === 'archived') reason = 'Dish is archived.'
      else if (!Object.hasOwn(dish, 'price')) reason = 'Dish price is not set.'
      else {
        try {
          readDishPricing(dish)
        } catch {
          reason = 'Dish pricing is incomplete.'
        }
      }
      if (reason)
        result.issues.push({
          sectionId: section.id,
          section: section.label || section.id,
          itemId: String(item.id || ''),
          name,
          reason,
        })
      else result.availableCount++
    }
  return result
}
