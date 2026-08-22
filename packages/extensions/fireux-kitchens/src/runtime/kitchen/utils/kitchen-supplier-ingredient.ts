import type { FirebaseTimestamp } from 'fireux-core/types/firebase'
import type { KitchenSupplierIngredient } from '../models/supplier-ingredient.model.ts'
export type { KitchenSupplierIngredient } from '../models/supplier-ingredient.model.ts'
export const KitchenSupplierIngredientStorage = { shape: 'scoped', path: 'kitchens/{kitchenId}/supplier-ingredients/{supplierIngredientId}', collection: 'supplier-ingredients', parent: 'kitchen', idParam: 'supplierIngredientId' } as const
export const KitchenSupplierIngredientDefaults: KitchenSupplierIngredient = { id: '', kitchen_id: '', supplier_id: '', ingredient_id: '', created: { at: {} as FirebaseTimestamp }, updated: { at: {} as FirebaseTimestamp } }
export type KitchenSupplierIngredientCreateInput = Omit<KitchenSupplierIngredient, 'id' | 'created' | 'updated'>
export type KitchenSupplierIngredientUpdateInput = Partial<Omit<KitchenSupplierIngredientCreateInput, 'kitchen_id' | 'supplier_id' | 'ingredient_id'>>
