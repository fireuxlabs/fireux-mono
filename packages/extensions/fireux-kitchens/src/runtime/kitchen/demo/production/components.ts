import type {
  KitchenDemoItemIngredientComponent,
  KitchenDemoItemPrepItemComponent,
  KitchenDemoItemRecipeComponent,
} from './types'

export const ingredientComponent = (
  id: string,
  ingredientId: string,
  quantity: number,
  unit: KitchenDemoItemIngredientComponent['unit']
): KitchenDemoItemIngredientComponent => ({
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
  unit: KitchenDemoItemPrepItemComponent['unit']
): KitchenDemoItemPrepItemComponent => ({
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
  unit: KitchenDemoItemRecipeComponent['unit']
): KitchenDemoItemRecipeComponent => ({
  id,
  source: 'recipe',
  recipeId,
  quantity,
  unit,
})
