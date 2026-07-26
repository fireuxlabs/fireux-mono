import type {
  IngredientCategory,
  IngredientKind,
} from '../../../models/ingredient-taxonomy'

export type IngredientCreateForm = {
  name: string
  aliases: string
  category: IngredientCategory
  kind: IngredientKind
  parent_ingredient_id: string
  image_url: string
}

export const createDefaultIngredientForm = (): IngredientCreateForm => ({
  name: '',
  aliases: '',
  category: 'other',
  kind: 'base',
  parent_ingredient_id: '',
  image_url: '',
})
