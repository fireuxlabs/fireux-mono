// FILE: packages/extensions/fireux-kitchens/src/runtime/models/ingredient.model.ts

import type { FireuxStamped } from 'fireux-core/runtime/models/core/meta.model'
import type { FirebaseTimestamp } from 'fireux-core/types/firebase'

/**
 * Ingredient (canonical Firestore shape)
 * Firestore: ingredients/{ingredientId}
 *
 * Canon:
 * - Ingredient identity is kitchen-usage based.
 * - Supplier naming never defines ingredient identity.
 * - Avoid taxonomy trees (no parent/child ingredient hierarchy).
 * - Supplier products should map to ingredients via kitchen-level linkage.
 */
export type IngredientStatus = 'active' | 'archived'
export type IngredientUnit =
  | 'g'
  | 'kg'
  | 'ml'
  | 'l'
  | 'piece'
  | 'pack'
  | 'tray'
  | 'case'

export const Ingredient = {
  id: '' as string,

  name: '' as string,
  description: '' as string,
  category: '' as string,
  image_url: '' as string,
  unit: 'piece' as IngredientUnit,
  status: 'active' as IngredientStatus,

  // Ingredient identity metadata.
  allergens: [] as string[],
  tags: [] as string[],

  app_id: '' as FireuxStamped['app_id'],
  creator_id: '' as FireuxStamped['creator_id'],
  created_at: {} as FirebaseTimestamp,
  updated_at: {} as FirebaseTimestamp,
} as const

export type Ingredient = {
  [K in keyof typeof Ingredient]: (typeof Ingredient)[K]
}

export type IngredientCreateInput = Omit<
  Ingredient,
  'id' | 'app_id' | 'creator_id' | 'created_at' | 'updated_at'
>
export type IngredientUpdateInput = Partial<Omit<IngredientCreateInput, never>>

/**
 * KitchenIngredient (kitchen-specific attachment + stock state)
 * Firestore: kitchens/{kitchenId}/ingredients/{ingredientId}
 */
export type KitchenIngredientStatus = 'active' | 'paused' | 'archived'

export const KitchenIngredient = {
  id: '' as string,
  kitchen_id: '' as string,
  ingredient_id: '' as string,
  supplier_id: '' as string,
  supplier_name: '' as string,
  supplier_product_id: '' as string,
  variety_note: '' as string,
  status: 'active' as KitchenIngredientStatus,

  // Kitchen-specific inventory controls.
  on_hand_qty: 0 as number,
  par_qty: 0 as number,
  reorder_qty: 0 as number,
  storage_location: '' as string,
  cost_per_unit: 0 as number,
  currency: 'CHF' as string,
  notes: '' as string,

  app_id: '' as FireuxStamped['app_id'],
  creator_id: '' as FireuxStamped['creator_id'],
  created_at: {} as FirebaseTimestamp,
  updated_at: {} as FirebaseTimestamp,
} as const

export type KitchenIngredient = {
  [K in keyof typeof KitchenIngredient]: (typeof KitchenIngredient)[K]
}

export type KitchenIngredientCreateInput = Omit<
  KitchenIngredient,
  'id' | 'app_id' | 'creator_id' | 'created_at' | 'updated_at'
>
export type KitchenIngredientUpdateInput = Partial<
  Omit<KitchenIngredientCreateInput, 'ingredient_id' | 'kitchen_id'>
>

// Backward-compatible aliases while Kitchen naming is still referenced.
export type KitchenIngredientUnit = IngredientUnit

/**
 * Read-time convenience shape for kitchen ingredient screens.
 * This is not stored as-is.
 */
export type KitchenIngredientResolved = KitchenIngredient &
  Partial<
    Pick<
      Ingredient,
      | 'name'
      | 'description'
      | 'category'
      | 'unit'
      | 'allergens'
      | 'tags'
    >
  >
