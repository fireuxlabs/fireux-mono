import type { FirebaseTimestamp } from 'fireux-core/types/firebase'
import type { KitchenIngredient } from '../models/ingredient.model.ts'
export type { KitchenIngredient } from '../models/ingredient.model.ts'
export const KitchenIngredientStorage = { shape: 'scoped', path: 'kitchens/{kitchenId}/ingredients/{kitchenIngredientId}', collection: 'ingredients', parent: 'kitchen', idParam: 'kitchenIngredientId' } as const
export const KitchenIngredientDefaults: KitchenIngredient = { id: '', ingredient_id: '', created: { at: {} as FirebaseTimestamp }, updated: { at: {} as FirebaseTimestamp } }
export type KitchenIngredientCreateInput = Omit<KitchenIngredient, 'id' | 'created' | 'updated'>
export type KitchenIngredientUpdateInput = Partial<Omit<KitchenIngredientCreateInput, 'ingredient_id'>>
