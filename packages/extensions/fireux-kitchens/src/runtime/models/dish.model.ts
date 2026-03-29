// FILE: packages/extensions/fireux-kitchens/src/runtime/models/dish.model.ts

import type { FireuxStamped } from 'fireux-core/runtime/models/core/meta.model'
import type { FirebaseTimestamp } from 'fireux-core/types/firebase'

/**
 * Runtime models canon: packages/core/fireux-docs/src/runtime/models/README.md
 *
 * Family: Kitchen-scoped
 * Storage: console-owned operational record
 * Path: /kitchens/<kitchenId>/dishes/<dishId>
 * Owner console: Kitchen
 *
 * Decision note:
 * - Dish exists because a kitchen owns and publishes it.
 * - Keep links to recipes or ingredients explicit through ids rather than inventing root twins.
 * - If Dish ever becomes a root entity, update the models README first, then this file.
 */

export const DishModel = {
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
  [K in keyof typeof DishModel]: (typeof DishModel)[K]
}

export type DishCreateInput = Omit<Dish, 'created' | 'updated'>
export type DishUpdateInput = Partial<Omit<Dish, 'id' | 'created' | 'updated' | 'kitchen_id'>>
