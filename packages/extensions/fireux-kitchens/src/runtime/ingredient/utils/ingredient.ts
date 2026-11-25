import type { FireuxStamps } from 'fireux-core/runtime/models/utils/stamps.model'
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
    by: '' as FireuxStamps['created']['by'],
    app_id: '' as FireuxStamps['created']['app_id'],
  },
  updated: {
    at: {} as FirebaseTimestamp,
    by: '' as FireuxStamps['updated']['by'],
  },
}
export type IngredientCreateInput = Omit<
  Ingredient,
  'id' | 'slug' | 'created' | 'updated'
>
export type IngredientUpdateInput = Partial<
  Omit<Ingredient, 'id' | 'slug' | 'created' | 'updated'>
>
