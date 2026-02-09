// FILE: packages/extensions/fireux-kitchens/src/runtime/models/objects/kitchen-recipe.model.ts

import type { FireuxStamped } from 'fireux-core/runtime/models/core/meta.model'
import type { FirebaseTimestamp } from 'fireux-core/types/firebase'

/**
 * Kitchen Recipe (canonical Firestore shape)
 * Firestore: kitchens/{kitchenId}/recipes/{recipeId}
 */
export type KitchenRecipeStatus = 'draft' | 'active' | 'archived'

export type KitchenRecipeIngredientLine = {
  ingredient_id: string
  ingredient_name: string
  quantity: number
  unit: string
  prep_note: string
}

export type KitchenRecipeStep = {
  id: string
  order: number
  title: string
  instruction: string
  minutes: number
}

export const KitchenRecipe = {
  id: '' as string,
  kitchen_id: '' as string,
  dish_id: '' as string,

  name: '' as string,
  description: '' as string,
  status: 'draft' as KitchenRecipeStatus,
  yield_qty: 0 as number,
  yield_unit: 'portion' as string,
  prep_minutes: 0 as number,
  cook_minutes: 0 as number,

  ingredient_lines: [] as KitchenRecipeIngredientLine[],
  steps: [] as KitchenRecipeStep[],
  notes: '' as string,
  tags: [] as string[],

  app_id: '' as FireuxStamped['app_id'],
  creator_id: '' as FireuxStamped['creator_id'],
  created_at: {} as FirebaseTimestamp,
  updated_at: {} as FirebaseTimestamp,
} as const

export type KitchenRecipe = {
  [K in keyof typeof KitchenRecipe]: (typeof KitchenRecipe)[K]
}

export type KitchenRecipeCreateInput = Omit<
  KitchenRecipe,
  'app_id' | 'creator_id' | 'created_at' | 'updated_at'
>
export type KitchenRecipeUpdateInput = Partial<
  Omit<KitchenRecipeCreateInput, 'id' | 'kitchen_id' | 'dish_id'>
>

