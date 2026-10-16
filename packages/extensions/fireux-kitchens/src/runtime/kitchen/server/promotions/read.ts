import { getRuntimeFirestore } from 'fireux-core/runtime/server/utils/getRuntimeFirestore'
import { normalizeKitchenPromotion } from '../../utils/promotions/pricing'
import type { PublicKitchenPromotion } from '../../models/promotion.model'

export async function readMenuPromotions(
  kitchenId: string,
  menuId: string,
  timezone: string,
  currency: string
): Promise<PublicKitchenPromotion[]> {
  if (!kitchenId || !menuId) return []
  const snapshot = await getRuntimeFirestore()
    .collection(`kitchens/${kitchenId}/promotions`)
    .where('menu_id', '==', menuId)
    .get()
  return snapshot.docs
    .flatMap((doc) => {
      const data = doc.data()
      if (data.status !== 'active') return []
      const { kind, name, status, menu_id, section_ids, amount_minor, days } =
        data
      const offer = normalizeKitchenPromotion({
        kind,
        name,
        status,
        menu_id,
        section_ids,
        currency: data.currency,
        amount_minor,
        days,
      })
      if (offer.currency !== currency || !timezone)
        throw new Error(
          'Promotion currency and venue timezone must be configured.'
        )
      return [{ ...offer, id: doc.id, timezone }]
    })
    .sort((a, b) => a.id.localeCompare(b.id))
}
