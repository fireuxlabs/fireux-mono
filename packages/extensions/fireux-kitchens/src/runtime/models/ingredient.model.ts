// FILE: packages/extensions/fireux-kitchens/src/runtime/models/ingredient.model.ts

import type { FireuxStamped } from 'fireux-core/runtime/models/core/meta.model'
import type { FirebaseTimestamp } from 'fireux-core/types/firebase'

/**
 * Runtime models canon: packages/core/fireux-docs/src/runtime/models/README.md
 *
 * Family: Domain Root
 * Storage: root canonical model
 * Root path: /ingredients/<ingredientId>
 * Console use: kitchens may own scoped usage records that link back through `ingredient_id`
 *
 * Decision note:
 * - Ingredient is reusable shared truth at root.
 * - Kitchen usage should be represented through scoped companion records rather than by mutating root identity.
 * - If that rule changes later, update the models README first, then this file.
 */
export const Ingredient = {
  id: '' as string,

  name: '' as string,
  slug: '' as string,
  image_url: '' as string,
  // Legacy top-level scope field still used by demo scenarios.
  app_id: '' as string,

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

export const IngredientModel = Ingredient

export type Ingredient = {
  [K in keyof typeof Ingredient]: (typeof Ingredient)[K]
}

export type IngredientCreateInput = Omit<
  Ingredient,
  'id' | 'created' | 'updated'
>
export type IngredientUpdateInput = Partial<Omit<IngredientCreateInput, never>>

/**
 * Family: Kitchen-scoped
 * Storage: console-owned operational record
 * Path: /kitchens/<kitchenId>/ingredients/<kitchenIngredientId>
 * Owner console: Kitchen
 *
 * Decision note:
 * - KitchenIngredient is the kitchen-owned usage record for a root Ingredient.
 * - Keep `ingredient_id` as the link back to root truth rather than mirroring root identity directly.
 */

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

export const KitchenIngredient = KitchenIngredientModel

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

/**
 * Family: Kitchen-scoped
 * Storage: console-owned operational record
 * Path: /kitchens/<kitchenId>/supplier-ingredients/<supplierIngredientId>
 * Owner console: Kitchen
 *
 * Decision note:
 * - This is a kitchen-owned supplier linkage record, not a root entity.
 * - Keep both supplier and ingredient links explicit through ids.
 */
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

export const KitchenSupplierIngredient = KitchenSupplierIngredientModel

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
