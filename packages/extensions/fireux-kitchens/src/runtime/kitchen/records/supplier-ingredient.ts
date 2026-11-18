import type { FireuxStamped } from 'fireux-core/runtime/models/utils/stamps.model'

export interface KitchenSupplierIngredient extends FireuxStamped {
  id: string
  kitchen_id: string
  supplier_id: string
  ingredient_id: string
}
