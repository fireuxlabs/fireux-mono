import { getRuntimeFirestore } from 'fireux-core/runtime/server/utils/getRuntimeFirestore'
import { normalizeKitchenPromotion } from '../../utils/promotions/pricing'
import type { PublicKitchenPromotion } from '../../models/promotion.model'

export async function readMenuPromotions(
  kitchenId: string,
  dishIds: string[],
  timezone: string,
  currency: string
): Promise<PublicKitchenPromotion[]> {
  if (!kitchenId || !dishIds.length) return []
  const snapshot = await getRuntimeFirestore()
    .collection(`kitchens/${kitchenId}/promotions`)
    .where('status', '==', 'active')
    .get()
  return snapshot.docs
    .flatMap((doc) => {
      const data = doc.data()
      // Bundle offers never alter standalone Dish prices.
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
      const visibleDishes = promotion.dishes.filter((dish) =>
        dishIds.includes(dish.dishId)
      )
      if (!visibleDishes.length) return []
      if (promotion.currency !== currency || !timezone)
        throw new Error(
          'Promotion currency and venue timezone must be configured.'
        )
      return [{ ...promotion, dishes: visibleDishes, id: doc.id, timezone }]
    })
    .sort((a, b) => a.id.localeCompare(b.id))
}
