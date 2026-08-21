import type { Ingredient } from './ingredient.model.ts'

/**
 * Ingredient Directory transport. Kitchen and Supplier operational records
 * carry only `ingredient_id`; readers resolve the canonical Ingredient here.
 */
export type IngredientDirectoryPage = {
  items: Ingredient[]
}

export type IngredientDetailResponse = {
  ingredient: Ingredient
}
