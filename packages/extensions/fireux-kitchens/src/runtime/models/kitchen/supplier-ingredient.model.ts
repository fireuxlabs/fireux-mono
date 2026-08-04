import type { FireuxStamped } from 'fireux-core/runtime/models/utils/stamps.model'
import type { FirebaseTimestamp } from 'fireux-core/types/firebase'

/**
 * Family: App-scoped Kitchen operation
 * Storage: scoped operational record
 * Path: apps/{appId}/kitchens/{kitchenId}/supplier-ingredients/{supplierIngredientId}
 * Owner app scope: Kitchen within an app runtime
 *
 * Decision note:
 * - This is a kitchen-owned supplier linkage record, not a root entity.
 * - Keep both supplier and ingredient links explicit through ids.
 */
export const KitchenSupplierIngredientStorage = {
  shape: 'scoped',
  path: 'apps/{appId}/kitchens/{kitchenId}/supplier-ingredients/{supplierIngredientId}',
  collection: 'supplier-ingredients',
  parent: 'kitchen',
  idParam: 'supplierIngredientId',
} as const

export const KitchenSupplierIngredientModel = {
  id: '' as string,
  kitchen_id: '' as string,
  supplier_id: '' as string,
  ingredient_id: '' as string,

  created: {
    at: {} as FirebaseTimestamp,
    by: '' as FireuxStamped['created']['by'],
    app_id: '' as FireuxStamped['created']['app_id'],
  },
  updated: {
    at: {} as FirebaseTimestamp,
    by: '' as FireuxStamped['updated']['by'],
  },
} as const

export type KitchenSupplierIngredient = {
  [K in keyof typeof KitchenSupplierIngredientModel]: (typeof KitchenSupplierIngredientModel)[K]
}

export type KitchenSupplierIngredientCreateInput = Omit<
  KitchenSupplierIngredient,
  'id' | 'created' | 'updated'
>
export type KitchenSupplierIngredientUpdateInput = Partial<
  Omit<KitchenSupplierIngredientCreateInput, 'kitchen_id' | 'supplier_id' | 'ingredient_id'>
>
