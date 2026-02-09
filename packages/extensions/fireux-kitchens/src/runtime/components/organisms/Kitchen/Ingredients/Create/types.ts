import type { IngredientUnit } from '../../../../../../models/ingredient.model'

export type KitchenIngredientCreateForm = {
  name: string
  category: string
  description: string
  unit: IngredientUnit
  supplier_id: string
  on_hand_qty: number
  par_qty: number
  reorder_qty: number
  storage_location: string
  supplier_name: string
  cost_per_unit: number
  currency: string
}

export const ingredientUnitOptions = [
  { label: 'Gram (g)', value: 'g' },
  { label: 'Kilogram (kg)', value: 'kg' },
  { label: 'Milliliter (ml)', value: 'ml' },
  { label: 'Liter (l)', value: 'l' },
  { label: 'Piece', value: 'piece' },
  { label: 'Pack', value: 'pack' },
  { label: 'Tray', value: 'tray' },
  { label: 'Case', value: 'case' },
] as const

export const createDefaultKitchenIngredientForm = (): KitchenIngredientCreateForm => ({
  name: '',
  category: '',
  description: '',
  unit: 'piece',
  supplier_id: '',
  on_hand_qty: 0,
  par_qty: 0,
  reorder_qty: 0,
  storage_location: '',
  supplier_name: '',
  cost_per_unit: 0,
  currency: 'CHF',
})
