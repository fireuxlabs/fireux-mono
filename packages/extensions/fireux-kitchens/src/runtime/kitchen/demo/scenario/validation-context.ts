import type {
  KitchenDemoScenarioAssembly,
  KitchenDemoScenarioInput,
} from './types'

export function createKitchenDemoValidationContext(
  input: KitchenDemoScenarioInput,
  assembly: KitchenDemoScenarioAssembly
) {
  return {
    ...assembly,
    ingredientIds: new Set(
      assembly.kitchenIngredients.map(ingredient => ingredient.ingredient_id)
    ),
    prepItemIds: new Set(assembly.prepItems.map(prepItem => prepItem.id)),
    recipeIds: new Set(assembly.recipes.map(recipe => recipe.id)),
    menuIds: new Set(assembly.menus.map(menu => menu.kitchenMenu.id)),
    stationIds: new Set(input.stations.map(station => station.id)),
  }
}
