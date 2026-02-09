import type { IngredientUnit } from '../../../../../models/objects/ingredient.model'

export type IngredientCreateForm = {
  name: string
  category: string
  unit: IngredientUnit
  description: string
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
  category: '',
  unit: 'piece',
  description: '',
})
