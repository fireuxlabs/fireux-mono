import type {
  Ingredient,
  KitchenIngredient as KitchenIngredientDoc,
} from 'fireux-kitchens/runtime/models/ingredient.model'
import {
  Ingredient as IngredientModel,
  KitchenIngredient as KitchenIngredientModel,
} from 'fireux-kitchens/runtime/models/ingredient.model'
import type { Dish as DishDoc } from 'fireux-kitchens/runtime/models/dish.model'
import { Dish as DishModel } from 'fireux-kitchens/runtime/models/dish.model'
import type { Menu as MenuDoc } from 'fireux-kitchens/runtime/models/menu.model'
import { Menu as MenuModel } from 'fireux-kitchens/runtime/models/menu.model'
import type { KitchenMiseTask as KitchenMiseTaskDoc } from 'fireux-kitchens/runtime/models/kitchen-mise.model'
import { KitchenMiseTask as KitchenMiseTaskModel } from 'fireux-kitchens/runtime/models/kitchen-mise.model'

export const buildIngredient = (overrides: Partial<Ingredient>): Ingredient =>
  ({
    ...IngredientModel,
    ...overrides,
  } as Ingredient)

export const buildKitchenIngredient = (params: {
  kitchenId: string
  ingredient: Ingredient
  overrides?: Partial<KitchenIngredientDoc>
}): KitchenIngredientDoc => {
  const { kitchenId, ingredient, overrides } = params
  const ingredientId = String(ingredient.id || '').trim()
  const kitchenIngredientDocId = `k_${kitchenId}__${ingredientId}`

  return {
    ...KitchenIngredientModel,
    ...(overrides ?? {}),
    id: kitchenIngredientDocId,
    kitchen_id: kitchenId,
    ingredient_id: ingredientId,
    name: String(ingredient.name || '').trim(),
    image_url: String(ingredient.image_url || '').trim(),
  } as KitchenIngredientDoc
}

export const buildDish = (params: {
  kitchenId: string
  overrides: Partial<DishDoc>
}): DishDoc =>
  ({
    ...DishModel,
    kitchen_id: params.kitchenId,
    ...params.overrides,
  } as DishDoc)

export const buildMenu = (params: {
  kitchenId: string
  overrides: Partial<MenuDoc>
}): MenuDoc =>
  ({
    ...MenuModel,
    kitchen_id: params.kitchenId,
    ...params.overrides,
  } as MenuDoc)

export const buildMise = (params: {
  kitchenId: string
  overrides: Partial<KitchenMiseTaskDoc>
}): KitchenMiseTaskDoc =>
  ({
    ...KitchenMiseTaskModel,
    kitchen_id: params.kitchenId,
    ...params.overrides,
  } as KitchenMiseTaskDoc)

export const assertAllKitchenIngredientsResolve = (params: {
  scenarioName: string
  kitchenId: string
  kitchenIngredientIds: string[]
  globalIngredientById: Map<string, Ingredient>
}) => {
  const { scenarioName, kitchenId, kitchenIngredientIds, globalIngredientById } = params
  const missing: string[] = []

  for (const ingredientId of kitchenIngredientIds) {
    if (!globalIngredientById.get(String(ingredientId || '').trim())) {
      missing.push(ingredientId)
    }
  }

  if (missing.length) {
    throw new Error(
      `[${scenarioName}] Missing global ingredients for kitchen "${kitchenId}": ${missing.join(', ')}`
    )
  }
}
