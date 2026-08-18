import type {
  KitchenDemoDishIngredientComponent,
  KitchenDemoDishPrepItemComponent,
  KitchenDemoDishRecipeComponent,
} from './types'

export const ingredientComponent = (
  id: string,
  ingredientId: string,
  quantity: number,
  unit: KitchenDemoDishIngredientComponent['unit']
): KitchenDemoDishIngredientComponent => ({
  id,
  source: 'ingredient',
  ingredientId,
  quantity,
  unit,
})

export const prepItemComponent = (
  id: string,
  prepItemId: string,
  quantity: number,
  unit: KitchenDemoDishPrepItemComponent['unit']
): KitchenDemoDishPrepItemComponent => ({
  id,
  source: 'prep_item',
  prepItemId,
  quantity,
  unit,
})

export const recipeComponent = (
  id: string,
  recipeId: string,
  quantity: number,
  unit: KitchenDemoDishRecipeComponent['unit']
): KitchenDemoDishRecipeComponent => ({
  id,
  source: 'recipe',
  recipeId,
  quantity,
  unit,
})

