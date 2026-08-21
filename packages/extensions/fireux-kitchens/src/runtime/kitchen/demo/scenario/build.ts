import { assembleKitchenDemoScenario } from './assembly'
import { validateKitchenDemoOperations } from './operation-validation'
import { validateKitchenDemoProduction } from './production-validation'
import { validateKitchenDemoServiceAndFinance } from './service-validation'
import type { KitchenDemoScenarioInput } from './types'
import type { KitchenDemoScenario } from '../core/types'

export function buildKitchenDemoScenario(
  input: KitchenDemoScenarioInput
): KitchenDemoScenario {
  const assembly = assembleKitchenDemoScenario(input)
  const {
    menus,
    menuModes,
    kitchenIngredients,
    supplierIngredientLinks,
    dishSpecs,
    dishFinance,
    finance,
    services,
    completedOrders,
    miseRequirements,
    menuItemComponentDeltas,
    prepItems,
    recipes,
    dishes,
  } = assembly
  const team = [...(input.team ?? [])]
  const invalidRelationships = [
    ...validateKitchenDemoProduction(input, assembly),
    ...validateKitchenDemoServiceAndFinance(input, assembly),
    ...validateKitchenDemoOperations(input, assembly),
  ]

  if (invalidRelationships.length) {
    throw new Error(
      'Kitchen Demo production relationships are invalid for ' +
        input.identity.kitchenId +
        ': ' +
        invalidRelationships.join(', ') +
        '.'
    )
  }

  return {
    appId: input.identity.appId,
    access: input.access,
    kitchen: input.kitchen,
    place: input.place,
    menus,
    menuModes,
    kitchenIngredients,
    supplierIngredientLinks,
    rootMenu: input.menu.rootMenu,
    kitchenMenu: input.menu.kitchenMenu,
    dishes: [...dishes.values()],
    dishSpecs,
    dishFinance,
    finance,
    team,
    services,
    completedOrders,
    menuItemComponentDeltas,
    menuSections: input.menu.menuSections,
    miseRequirements,
    orders: input.orders,
    prepItems,
    recipes,
    stations: input.stations,
    miseTasks: input.miseTasks,
  }
}
