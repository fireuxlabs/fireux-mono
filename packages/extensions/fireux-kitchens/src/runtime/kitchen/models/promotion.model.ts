import type { WeekdayTimeDay } from '../../models/shared/weekday-time.model'

/** Kitchen-owned price offer. Bundles have no runtime contract yet. */
export type KitchenPromotionInput = {
  kind: 'fixed_price'
  name: string
  status: 'active' | 'paused'
  menu_id: string
  section_ids: string[]
  currency: string
  amount_minor: number
  days: WeekdayTimeDay[]
}
export type KitchenPromotion = KitchenPromotionInput & { id: string }
export type PublicKitchenPromotion = KitchenPromotion & { timezone: string }
