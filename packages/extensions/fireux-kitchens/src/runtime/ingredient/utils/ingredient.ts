import type { FireuxStamped } from 'fireux-core/runtime/models/utils/stamps.model'
import type { FirebaseTimestamp } from 'fireux-core/types/firebase'
import type { Ingredient } from '../models/ingredient.model'

export type { Ingredient } from '../models/ingredient.model'
export const IngredientStorage = { shape: 'root', path: 'ingredients/{ingredientId}', collection: 'ingredients', idParam: 'ingredientId' } as const
export const IngredientDefaults: Ingredient = { id: '', schema_version: 2, name: '', aliases: [], slug: '', category: 'other', kind: 'base', parent_ingredient_id: undefined, status: 'active', replaced_by_ingredient_id: undefined, image_url: '', created: { at: {} as FirebaseTimestamp, by: '' as FireuxStamped['created']['by'], app_id: '' as FireuxStamped['created']['app_id'] }, updated: { at: {} as FirebaseTimestamp, by: '' as FireuxStamped['updated']['by'] } }
export type IngredientCreateInput = Omit<Ingredient, 'id' | 'schema_version' | 'slug' | 'created' | 'updated'>
export type IngredientUpdateInput = Partial<Omit<Ingredient, 'id' | 'schema_version' | 'slug' | 'created' | 'updated'>>
