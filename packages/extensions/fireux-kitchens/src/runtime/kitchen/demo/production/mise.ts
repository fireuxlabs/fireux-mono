import { deanosKitchenDemoPrepItems } from './prep-items'
import { deanosKitchenDemoRecipes } from './recipes'
import type { KitchenDemoMiseRequirement, KitchenDemoStationId } from './types'

const recipeStationId = (recipeId: string): KitchenDemoStationId => {
  if (
    [
      'salted-caramel-sauce',
      'cherry-vanilla-syrup',
      'house-lemonade-cordial',
      'strawberry-lime-cooler-base',
      'cucumber-mint-cooler-base',
    ].includes(recipeId)
  ) {
    return 'drinks'
  }
  if (
    ['deanos-crispy-batter', 'fried-camembert', 'fried-brie-bites'].includes(
      recipeId
    )
  ) {
    return 'fryers'
  }
  if (recipeId === 'caramelised-onions') return 'grill'
  return 'prep'
}

export const deanosKitchenDemoMise: KitchenDemoMiseRequirement[] = [
  ...deanosKitchenDemoPrepItems.map(
    (prepItem): KitchenDemoMiseRequirement => ({
      id: `prepare-${prepItem.id}`,
      title: `Prepare ${prepItem.name}`,
      station: prepItem.station,
      amount: { ...prepItem.yield },
      source: {
        kind: 'prep_item',
        prepItemId: prepItem.id,
      },
    })
  ),
  ...deanosKitchenDemoRecipes.map(
    (recipe): KitchenDemoMiseRequirement => ({
      id: `make-${recipe.id}`,
      title: `Make ${recipe.name}`,
      station: recipeStationId(recipe.id),
      amount: { ...recipe.yield },
      source: {
        kind: 'recipe',
        recipeId: recipe.id,
      },
    })
  ),
]
