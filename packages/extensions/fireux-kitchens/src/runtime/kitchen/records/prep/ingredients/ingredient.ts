import type { FireuxStamps } from 'fireux-core/runtime/models/utils/stamps.model'

export interface KitchenIngredient extends FireuxStamps {
  id: string
  ingredient_id: string
}
