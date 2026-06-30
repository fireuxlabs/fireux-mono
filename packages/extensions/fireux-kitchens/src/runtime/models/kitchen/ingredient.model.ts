import type { FireuxStamped } from 'fireux-core/runtime/models/core/meta.model'
import type { FirebaseTimestamp } from 'fireux-core/types/firebase'

/**
 * Family: App-scoped Kitchen operation
 * Storage: scoped operational record
 * Path: apps/{appId}/kitchens/{kitchenId}/ingredients/{kitchenIngredientId}
 * Owner app scope: Kitchen within an app runtime
 *
 * Decision note:
 * - KitchenIngredient is the kitchen-owned usage record for a root Ingredient.
 * - Keep `ingredient_id` as the link back to root truth rather than mirroring root identity directly.
 */
export const KitchenIngredientStorage = {
  shape: 'scoped',
  path: 'apps/{appId}/kitchens/{kitchenId}/ingredients/{kitchenIngredientId}',
  collection: 'ingredients',
  parent: 'kitchen',
  idParam: 'kitchenIngredientId',
} as const

export const KitchenIngredientModel = {
  id: '' as string,
  // Same value as document id; kept explicit for query and migration ergonomics.
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

export type KitchenIngredient = {
  [K in keyof typeof KitchenIngredientModel]: (typeof KitchenIngredientModel)[K]
}

export type KitchenIngredientCreateInput = Omit<
  KitchenIngredient,
  'id' | 'created' | 'updated'
>
export type KitchenIngredientUpdateInput = Partial<
  Omit<KitchenIngredientCreateInput, 'ingredient_id'>
>
