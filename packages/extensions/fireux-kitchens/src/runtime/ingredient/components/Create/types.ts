import type { IngredientCategory } from '../../models/ingredient-taxonomy'

export type IngredientCreateForm = {
  name: string
  aliases: string
  category: IngredientCategory
  image_url: string
}

export const createDefaultIngredientForm = (): IngredientCreateForm => ({
  name: '',
  aliases: '',
  category: 'vegetables',
  image_url: '',
})
