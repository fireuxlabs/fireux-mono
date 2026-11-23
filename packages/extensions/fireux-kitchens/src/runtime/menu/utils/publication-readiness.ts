import { readItemPricing, readItemSellingTerms } from '../../kitchen/utils/item-pricing'
import {
  normalizeKitchenPromotion,
  promotionItemIds,
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
    entryId: string
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
      const dish = dishes.get(String(item.item_id || ''))
      const stored = promotions.get(String(item.promotion_id || ''))
      let reason = ''
      const name = String(
        (item.promotion_id ? stored?.name : dish?.name) ||
          item.promotion_id ||
          item.item_id ||
          'Unavailable entry'
      )
      if (item.promotion_id) {
        if (item.item_id)
          reason = 'Entry references both a Item and a meal deal.'
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
              promotionItemIds(deal).some(
                (id) => !dishes.has(id) || dishes.get(id)?.status === 'archived'
              )
            )
              reason = 'Meal deal includes an unavailable Item.'
            else {
              for (const id of promotionItemIds(deal)) {
                const row = dishes.get(id)!
                if (row.pricing_error) throw new Error('Invalid Item pricing.')
                readItemSellingTerms(row)
              }
            }
          } catch {
            reason = 'Meal deal is incomplete.'
          }
        }
      } else if (!dish) reason = 'Item is missing.'
      else if (dish.status === 'archived') reason = 'Item is archived.'
      else if (dish.pricing_error) reason = 'Item pricing is incomplete.'
      else {
        try {
          readItemPricing(dish)
        } catch {
          reason =
            !Object.hasOwn(dish, 'price') &&
            Array.isArray(dish.choice_groups ?? []) &&
            !(dish.choice_groups as unknown[] | undefined)?.length
              ? 'Item price is not set.'
              : 'Item pricing is incomplete.'
        }
      }
      if (reason)
        result.issues.push({
          sectionId: section.id,
          section: section.label || section.id,
          entryId: String(item.id || ''),
          name,
          reason,
        })
      else result.availableCount++
    }
  return result
}
export function isPublicBrowseMenu(menu: {
  audience?: unknown
  format?: unknown
  schedule?: unknown
}) {
  return (
    (menu.audience === undefined || menu.audience === 'public') &&
    (menu.format === undefined || menu.format === 'interactive') &&
    (menu.schedule === undefined || menu.schedule === 'regular')
  )
}
