/** Local editor values preserve blank amounts until validation. */
export type PromotionItemDraft = { dishId: string; price: string | number }
export type MealDealGroupDraft = {
  id: string
  name: string
  choose: string | number
  dishes: { dishId: string; supplement: string | number }[]
}
export type PromotionItemOption = { label: string; value: string }
