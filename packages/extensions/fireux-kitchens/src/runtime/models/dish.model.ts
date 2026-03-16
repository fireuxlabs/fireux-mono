// FILE: packages/extensions/fireux-kitchens/src/runtime/models/dish.model.ts

import type { FireuxStamped } from 'fireux-core/runtime/models/core/meta.model'
import type { FirebaseTimestamp } from 'fireux-core/types/firebase'

/**
 * Minimal dish model (Phase 1)
 * Firestore: kitchens/{kitchenId}/dishes/{dishId}
 */

export const Dish = {
  id: '' as string,
  kitchen_id: '' as string,

  name: '' as string,
  short_name: '' as string,
  description: '' as string,
  image_url: '' as string,

  primary_recipe_id: '' as string,
  recipe_ids: [] as string[],
  ingredient_ids: [] as string[],
  mise_ids: [] as string[],

  sort_order: 0 as number,
  active: true as boolean,

  created: {
    at: {} as FirebaseTimestamp,
    by: '' as FireuxStamped['created']['by'],
    app_id: '' as FireuxStamped['created']['app_id'],
  },
  updated: {
    at: {} as FirebaseTimestamp,
    by: '' as FireuxStamped['created']['by'],
  },
} as const

export type Dish = {
  [K in keyof typeof Dish]: (typeof Dish)[K]
}

export type DishCreateInput = Omit<
  Dish,
  'created' | 'updated'
>
export type DishUpdateInput = Partial<Omit<DishCreateInput, 'id' | 'kitchen_id'>>
