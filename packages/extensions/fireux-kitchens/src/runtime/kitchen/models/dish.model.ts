import type { FireuxStamped } from 'fireux-core/runtime/models/utils/stamps.model'

export const dishCategories = [
  { value: 'main', label: 'Mains' },
  { value: 'side', label: 'Sides' },
  { value: 'vegetable', label: 'Vegetables' },
  { value: 'salad', label: 'Salads' },
  { value: 'soup', label: 'Soups' },
  { value: 'dessert', label: 'Desserts' },
  { value: 'sauce', label: 'Sauces' },
  { value: 'bread', label: 'Breads' },
  { value: 'cheese', label: 'Cheese' },
] as const
export type DishCategory = (typeof dishCategories)[number]['value']
export const dishCategoryLabel = (value?: string) =>
  dishCategories.find((category) => category.value === value)?.label ||
  'Uncategorised'

export type DishItemKind = 'food' | 'drink'

export type DishSpec = {
  portion: number
  station: string
  ingredients: {
    ingredient_id: string
    quantity: number
    unit: string
    note: string
  }[]
  prep_items: {
    prep_item_id: string
    quantity: number
    unit: string
    note: string
  }[]
  recipe_ids: string[]
  assembly: string[]
  source_note: string
}

export type DishPriceOption = {
  label: string
  quantity: number
  unit: string
  price: number
}
export type DishAddOnOption = { id: string; label: string; price: number }
export type DishPricing = {
  /** Refundable bottle charge; exchange waives it on takeaway selections. */
  bottle_deposit?: number
  price: number
  price_options: DishPriceOption[]
  add_ons: DishAddOnOption[]
}
export type Dish = FireuxStamped &
  Omit<DishPricing, 'price'> & {
    /** Absent until an operator sets a normal price; explicit zero is free. */
    price?: number
    context?: string
    id: string
    name: string
    slug: string
    description: string
    item_kind: DishItemKind
    is_flagship: boolean
    image: string
    kitchen_id: string
    category?: DishCategory
    spec?: DishSpec
  }
