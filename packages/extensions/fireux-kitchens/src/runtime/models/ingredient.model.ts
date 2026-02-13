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
export const Ingredient = {
  id: '' as string,

  name: '' as string,
  slug: '' as string,
  image_url: '' as string,

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
 * KitchenIngredient (kitchen-specific attachment/link)
 * Firestore: kitchens/{kitchenId}/ingredients/{ingredientId}
 */

export const KitchenIngredient = {
  id: '' as string,
  // Same value as document id; kept explicit for query and migration ergonomics.
  ingredient_id: '' as string,

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
  Omit<KitchenIngredientCreateInput, 'ingredient_id'>
>

/**
 * KitchenSupplierIngredient (kitchen supplier <-> ingredient link)
 * Firestore: kitchens/{kitchenId}/supplier-ingredients/{supplierIngredientId}
 */
export const KitchenSupplierIngredient = {
  id: '' as string,
  kitchen_id: '' as string,
  supplier_id: '' as string,
  ingredient_id: '' as string,

  app_id: '' as FireuxStamped['app_id'],
  creator_id: '' as FireuxStamped['creator_id'],
  created_at: {} as FirebaseTimestamp,
  updated_at: {} as FirebaseTimestamp,
} as const

export type KitchenSupplierIngredient = {
  [K in keyof typeof KitchenSupplierIngredient]: (typeof KitchenSupplierIngredient)[K]
}

export type KitchenSupplierIngredientCreateInput = Omit<
  KitchenSupplierIngredient,
  'id' | 'app_id' | 'creator_id' | 'created_at' | 'updated_at'
>
export type KitchenSupplierIngredientUpdateInput = Partial<
  Omit<KitchenSupplierIngredientCreateInput, 'kitchen_id' | 'supplier_id' | 'ingredient_id'>
>

/**
 * Read-time convenience shape for kitchen ingredient screens.
 * This is not stored as-is.
 */
export type KitchenIngredientResolved = KitchenIngredient &
  {
    supplier_id?: string
    supplier_name?: string
  } &
  Partial<
    Pick<
      Ingredient,
      | 'name'
      | 'image_url'
    >
  >

/**
 * Read-time convenience shape for kitchen supplier ingredient screens.
 * This is not stored as-is.
 */
export type KitchenSupplierIngredientResolved = KitchenSupplierIngredient &
  Partial<
    Pick<
      Ingredient,
      | 'name'
      | 'image_url'
    >
  >
