// FILE: packages/extensions/fireux-kitchens/src/runtime/models/dish.model.ts

import type { FireuxStamped } from 'fireux-core/runtime/models/core/meta.model'
import type { FirebaseTimestamp } from 'fireux-core/types/firebase'

/**
 * Dish (canonical Firestore shape)
 * Firestore: kitchens/{kitchenId}/dishes/{dishId}
 */
export type DishStatus = 'draft' | 'active' | 'archived'
export type DishCourse = 'starter' | 'main' | 'dessert' | 'side' | 'drink' | 'other'

export const Dish = {
  id: '' as string,
  kitchen_id: '' as string,

  name: '' as string,
  description: '' as string,
  status: 'draft' as DishStatus,
  course: 'main' as DishCourse,
  station: '' as string,
  recipe_id: '' as string,
  image_url: '' as string,
  tags: [] as string[],
  ingredient_ids: [] as string[],
  mise_ids: [] as string[],
  sort_order: 0 as number,
  active: true as boolean,

  app_id: '' as FireuxStamped['app_id'],
  creator_id: '' as FireuxStamped['creator_id'],
  created_at: {} as FirebaseTimestamp,
  updated_at: {} as FirebaseTimestamp,
} as const

export type Dish = {
  [K in keyof typeof Dish]: (typeof Dish)[K]
}

export type DishCreateInput = Omit<
  Dish,
  'app_id' | 'creator_id' | 'created_at' | 'updated_at'
>
export type DishUpdateInput = Partial<Omit<DishCreateInput, 'id' | 'kitchen_id'>>
