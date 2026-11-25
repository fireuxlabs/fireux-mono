import type { FireuxStamps } from 'fireux-core/runtime/models/utils/stamps.model'

export interface KitchenSupplierIngredient extends FireuxStamps {
  id: string
  kitchen_id: string
  supplier_id: string
  ingredient_id: string
}
