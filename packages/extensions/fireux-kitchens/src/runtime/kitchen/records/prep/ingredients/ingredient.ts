import type { FireuxStamped } from 'fireux-core/runtime/models/utils/stamps.model'

export interface KitchenIngredient extends FireuxStamped {
  id: string
  ingredient_id: string
}
