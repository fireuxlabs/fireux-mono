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

  const configuration = input.configuration
  return {
    appId: input.identity.appId,
    access: input.access,
    kitchen: { ...input.kitchen, ...configuration },
    configuration,
    offerings: input.offerings,
    fulfilment: input.fulfilment,
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
    prepItems,
    recipes,
    stations: input.stations,
  }
}
