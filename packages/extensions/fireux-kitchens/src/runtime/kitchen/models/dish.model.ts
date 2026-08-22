import type { FireuxStamped } from 'fireux-core/runtime/models/utils/stamps.model'

export type DishItemKind = 'food' | 'drink'

export type Dish = FireuxStamped & {
  id: string
  name: string
  slug: string
  description: string
  item_kind: DishItemKind
  is_deal: boolean
  is_flagship: boolean
  image: string
  kitchen_id: string
}
