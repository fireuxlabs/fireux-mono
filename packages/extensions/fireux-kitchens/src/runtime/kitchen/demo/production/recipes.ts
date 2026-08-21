import { deanosKitchenDemoDrinkRecipes } from './recipes/drinks'
import { deanosKitchenDemoSeasonalRecipes } from './recipes/seasonal'
import { deanosKitchenDemoServiceRecipes } from './recipes/service'
import type { KitchenDemoProductionRecipe } from './types'

export const deanosKitchenDemoRecipes: KitchenDemoProductionRecipe[] = [
  ...deanosKitchenDemoServiceRecipes,
  ...deanosKitchenDemoDrinkRecipes,
  ...deanosKitchenDemoSeasonalRecipes,
]
