import type { WeekdayTimeDay } from '../../../../models/shared/weekday-time.model'

export type PromotionalDish = { item_id: string; price: number }
export type MealDealChoice = { item_id: string; supplement: number }
export type MealDealGroup = {
  id: string
  name: string
  choose: number
  dishes: MealDealChoice[]
}

type PromotionSchedule = {
  name: string
  status: 'active' | 'paused'
  currency: string
  days: WeekdayTimeDay[]
}
export type KitchenDishOffer = PromotionSchedule & { dishes: PromotionalDish[] }
export type KitchenMealDeal = PromotionSchedule & {
  price: number
  groups: MealDealGroup[]
}
export type KitchenPromotionInput = KitchenDishOffer | KitchenMealDeal
export type KitchenPromotion = KitchenPromotionInput & { id: string }
/** Only standalone Dish offers participate in existing public item repricing. */
export type PublicKitchenPromotion = PromotionSchedule & {
  dishes: Array<{ itemId: string; price: number }>
  id: string
  timezone: string
}
