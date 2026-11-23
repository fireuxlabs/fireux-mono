import type { LiveProjectionSources } from 'fireux-core/runtime/server/utils/live-projection-sources'
import { getRuntimeFirestore } from 'fireux-core/runtime/server/utils/getRuntimeFirestore'
import { normalizeKitchenPromotion } from '../../utils/promotions/pricing'
import type { PublicKitchenPromotion } from '../../records/menus/promotions/promotion'

export async function readMenuPromotions(
  kitchenId: string,
  itemIds: string[],
  timezone: string,
  currency: string,
  sources?: LiveProjectionSources
): Promise<PublicKitchenPromotion[]> {
  if (!kitchenId || !itemIds.length) return []
  const query = getRuntimeFirestore()
    .collection(`kitchens/${kitchenId}/promotions`)
    .where('status', '==', 'active')
  sources?.watch(query)
  const snapshot = await query.get()
  return snapshot.docs
    .flatMap((doc) => {
      const data = doc.data()
      // Bundle offers never alter standalone Item prices.
      if (Object.hasOwn(data, 'groups')) return []
      const { name, status, currency: storedCurrency, days, dishes } = data
      const promotion = normalizeKitchenPromotion({
        name,
        status,
        currency: storedCurrency,
        days,
        dishes,
      })
      if (!('dishes' in promotion)) return []
      const visibleItems = promotion.dishes.filter((dish) =>
        itemIds.includes(dish.item_id)
      )
      if (!visibleItems.length) return []
      if (promotion.currency !== currency || !timezone)
        throw new Error(
          'Promotion currency and venue timezone must be configured.'
        )
      return [{ ...promotion, dishes: visibleItems.map(({ item_id, price }) => ({ itemId: item_id, price })), id: doc.id, timezone }]
    })
    .sort((a, b) => a.id.localeCompare(b.id))
}
