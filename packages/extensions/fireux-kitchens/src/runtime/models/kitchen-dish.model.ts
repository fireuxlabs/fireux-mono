// FILE: packages/extensions/fireux-kitchens/src/runtime/models/kitchen-dish.model.ts

import type { FireuxStamped } from 'fireux-core/runtime/models/core/meta.model'
import type { FirebaseTimestamp } from 'fireux-core/types/firebase'

/**
 * Kitchen Dish (canonical Firestore shape)
 * Firestore: kitchens/{kitchenId}/dishes/{dishId}
 */
export type KitchenDishStatus = 'draft' | 'active' | 'archived'
export type KitchenDishCourse = 'starter' | 'main' | 'dessert' | 'side' | 'drink' | 'other'

export const KitchenDish = {
  id: '' as string,
  kitchen_id: '' as string,

  name: '' as string,
  description: '' as string,
  status: 'draft' as KitchenDishStatus,
  course: 'main' as KitchenDishCourse,
  station: '' as string,
  recipe_id: '' as string,
  image_url: '' as string,
  tags: [] as string[],
  sort_order: 0 as number,
  active: true as boolean,

  app_id: '' as FireuxStamped['app_id'],
  creator_id: '' as FireuxStamped['creator_id'],
  created_at: {} as FirebaseTimestamp,
  updated_at: {} as FirebaseTimestamp,
} as const

export type KitchenDish = {
  [K in keyof typeof KitchenDish]: (typeof KitchenDish)[K]
}

export type KitchenDishCreateInput = Omit<
  KitchenDish,
  'app_id' | 'creator_id' | 'created_at' | 'updated_at'
>
export type KitchenDishUpdateInput = Partial<Omit<KitchenDishCreateInput, 'id' | 'kitchen_id'>>

