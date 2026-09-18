import type { FireuxStamped } from 'fireux-core/runtime/models/utils/stamps.model'
import type { FirebaseTimestamp } from 'fireux-core/types/firebase'
import type { Ingredient } from '../models/ingredient.model'

export type { Ingredient } from '../models/ingredient.model'
export const IngredientStorage = {
  shape: 'root',
  path: 'ingredients/{ingredientId}',
  collection: 'ingredients',
  idParam: 'ingredientId',
} as const
export const IngredientDefaults: Ingredient = {
  id: '',
  name: '',
  aliases: [],
  slug: '',
  category: 'vegetables',
  image_url: '',
  created: {
    at: {} as FirebaseTimestamp,
    by: '' as FireuxStamped['created']['by'],
    app_id: '' as FireuxStamped['created']['app_id'],
  },
  updated: {
    at: {} as FirebaseTimestamp,
    by: '' as FireuxStamped['updated']['by'],
  },
}
export type IngredientCreateInput = Omit<
  Ingredient,
  'id' | 'slug' | 'created' | 'updated'
>
export type IngredientUpdateInput = Partial<
  Omit<Ingredient, 'id' | 'slug' | 'created' | 'updated'>
>
