import type { IngredientUnit } from '../../../../../../models/ingredient.model'

export type KitchenIngredientCreateForm = {
  name: string
  category: string
  description: string
  unit: IngredientUnit
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
})
