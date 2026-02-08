import type { IngredientUnit } from '../../../../../models/objects/ingredient.model'

export type IngredientCreateForm = {
  name: string
  unit: IngredientUnit
  supplier_name: string
  cost_per_unit: number
  currency: string
  description: string
  sku: string
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

export const createDefaultIngredientForm = (): IngredientCreateForm => ({
  name: '',
  unit: 'piece',
  supplier_name: '',
  cost_per_unit: 0,
  currency: 'CHF',
  description: '',
  sku: '',
})
