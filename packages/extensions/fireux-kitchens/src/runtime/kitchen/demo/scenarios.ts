import { deanosOrdering, pizzaOrdering, miseboxOrdering } from './ordering'
// Deterministic Kitchen Demo worlds composed from package-owned domain fixtures.
import {
  deanosKitchenDemoMenu,
  deanosPartyDemoMenu,
  deanosXmasDemoMenu,
  miseboxRestaurantKitchenDemoMenu,
  pizzaTheActionKitchenDemoMenu,
} from './operations/Menus'
import { deanosKitchenDemoMenuModes } from './operations/Menus/availability'
import {
  deanosKitchenDemoIdentity,
  miseboxRestaurantKitchenDemoIdentity,
  pizzaTheActionKitchenDemoIdentity,
} from './core/fixtures'
import { deanosKitchenDemoFinance } from './finance'
import { deanosKitchenDemoDishFinance } from './operations/Dishes/finance'
import {
  deanosKitchenDemoIngredientLinks,
  deanosKitchenDemoSupplierIngredientLinks,
  miseboxRestaurantKitchenDemoIngredientLinks,
  miseboxRestaurantKitchenDemoSupplierIngredientLinks,
  pizzaTheActionKitchenDemoIngredientLinks,
  pizzaTheActionKitchenDemoSupplierIngredientLinks,
} from './operations/Ingredients'
import {
  deanosKitchenDemoOrders,
  deanosKitchenDemoStations,
  miseboxRestaurantKitchenDemoOrders,
  miseboxRestaurantKitchenDemoStations,
  pizzaTheActionKitchenDemoOrders,
  pizzaTheActionKitchenDemoStations,
} from './operations'
import {
  deanosKitchenDemoMenuItemComponentDeltas,
  deanosKitchenDemoPrepItems,
  deanosKitchenDemoRecipes,
  deanosKitchenDemoSpecs,
} from './production'
import type {
  KitchenDemoScenario,
  KitchenDemoScenarioDescriptor,
} from './core/types'
import { deanosKitchenDemoTeam } from './team'
import {
  deanosKitchenDemoCompletedOrders,
  deanosKitchenDemoServices,
} from './operations/Orders/history'
import {
  deanosKitchenDemoTarget,
  miseboxRestaurantKitchenDemoTarget,
  pizzaTheActionKitchenDemoTarget,
} from './core/targets'
import { buildKitchenDemoScenario } from './scenario/build'

export const deanosKitchenDemoScenario = buildKitchenDemoScenario({
  identity: deanosKitchenDemoIdentity,
  access: deanosKitchenDemoTarget.access,
  kitchen: deanosKitchenDemoTarget.kitchen,
  configuration: {
    ...deanosKitchenDemoTarget.configuration,
    ordering: deanosOrdering,
  },
  place: deanosKitchenDemoTarget.place,
  menu: deanosKitchenDemoMenu,
  menuModes: deanosKitchenDemoMenuModes,
  additionalMenus: [deanosPartyDemoMenu, deanosXmasDemoMenu],
  dishSpecs: deanosKitchenDemoSpecs,
  dishFinance: deanosKitchenDemoDishFinance,
  finance: deanosKitchenDemoFinance,
  team: deanosKitchenDemoTeam,
  services: deanosKitchenDemoServices,
  completedOrders: deanosKitchenDemoCompletedOrders,
  kitchenIngredients: deanosKitchenDemoIngredientLinks,
  menuItemComponentDeltas: deanosKitchenDemoMenuItemComponentDeltas,
  orders: deanosKitchenDemoOrders,
  prepItems: deanosKitchenDemoPrepItems,
  recipes: deanosKitchenDemoRecipes,
  stations: deanosKitchenDemoStations,
  supplierIngredientLinks: deanosKitchenDemoSupplierIngredientLinks,
})

export const pizzaTheActionKitchenDemoScenario = buildKitchenDemoScenario({
  identity: pizzaTheActionKitchenDemoIdentity,
  access: pizzaTheActionKitchenDemoTarget.access,
  kitchen: pizzaTheActionKitchenDemoTarget.kitchen,
  configuration: {
    ...pizzaTheActionKitchenDemoTarget.configuration,
    ordering: pizzaOrdering,
  },
  place: pizzaTheActionKitchenDemoTarget.place,
  menu: pizzaTheActionKitchenDemoMenu,
  kitchenIngredients: pizzaTheActionKitchenDemoIngredientLinks,
  orders: pizzaTheActionKitchenDemoOrders,
  stations: pizzaTheActionKitchenDemoStations,
  supplierIngredientLinks: pizzaTheActionKitchenDemoSupplierIngredientLinks,
})

export const miseboxRestaurantKitchenDemoScenario = buildKitchenDemoScenario({
  identity: miseboxRestaurantKitchenDemoIdentity,
  access: miseboxRestaurantKitchenDemoTarget.access,
  kitchen: miseboxRestaurantKitchenDemoTarget.kitchen,
  configuration: {
    ...miseboxRestaurantKitchenDemoTarget.configuration,
    ordering: miseboxOrdering,
  },
  place: miseboxRestaurantKitchenDemoTarget.place,
  menu: miseboxRestaurantKitchenDemoMenu,
  kitchenIngredients: miseboxRestaurantKitchenDemoIngredientLinks,
  orders: miseboxRestaurantKitchenDemoOrders,
  stations: miseboxRestaurantKitchenDemoStations,
  supplierIngredientLinks: miseboxRestaurantKitchenDemoSupplierIngredientLinks,
})

export const defaultKitchenDemoScenario = miseboxRestaurantKitchenDemoScenario
export const featuredMenuDemoScenario = defaultKitchenDemoScenario
export const featuredKioskDemoScenario = defaultKitchenDemoScenario
export const featuredServiceDemoScenario: KitchenDemoScenario = {
  ...deanosKitchenDemoScenario,
  orders: deanosKitchenDemoOrders,
}

export const kitchenDemoScenarios: KitchenDemoScenario[] = [
  defaultKitchenDemoScenario,
  deanosKitchenDemoScenario,
  pizzaTheActionKitchenDemoScenario,
]

export const kitchenDemoScenarioDescriptors: KitchenDemoScenarioDescriptor[] = [
  {
    kitchenId: miseboxRestaurantKitchenDemoIdentity.kitchenId,
    maturity: 'operational',
    operationCoverage: [
      'dishes',
      'ingredients',
      'menus',
      'orders',
      'stations',
      'suppliers',
      'tables',
    ],
    presentation: ['menu', 'kiosk', 'service'],
  },
  {
    kitchenId: deanosKitchenDemoIdentity.kitchenId,
    maturity: 'operational',
    operationCoverage: [
      'dishes',
      'ingredients',
      'menus',
      'orders',
      'recipes',
      'stations',
      'suppliers',
      'tables',
    ],
    presentation: ['menu', 'kiosk', 'service'],
  },
  {
    kitchenId: pizzaTheActionKitchenDemoIdentity.kitchenId,
    maturity: 'operational',
    operationCoverage: [
      'dishes',
      'ingredients',
      'menus',
      'orders',
      'stations',
      'suppliers',
      'tables',
    ],
    presentation: ['menu', 'kiosk', 'service'],
  },
]

const scenarioIds = kitchenDemoScenarios.map((value) => value.kitchen.id).sort()
const descriptorIds = kitchenDemoScenarioDescriptors
  .map((value) => value.kitchenId)
  .sort()
if (
  scenarioIds.length !== descriptorIds.length ||
  scenarioIds.some((value, index) => value !== descriptorIds[index])
) {
  throw new Error(
    'Every Kitchen Demo scenario requires one maturity descriptor.'
  )
}

const miseboxDemoSupplierIds = [
  'alpine-foodservice',
  'bern-market-garden',
  'pantry-house',
]
const sameStringSet = (left: string[], right: string[]) => {
  const normalizedLeft = [...new Set(left)].sort()
  const normalizedRight = [...new Set(right)].sort()
  return (
    normalizedLeft.length === normalizedRight.length &&
    normalizedLeft.every((value, index) => value === normalizedRight[index])
  )
}

if (
  kitchenDemoScenarios.length !== 3 ||
  kitchenDemoScenarios.some(
    (scenario) =>
      !scenario.menus.length ||
      !scenario.dishes.length ||
      !scenario.kitchenIngredients.length ||
      !scenario.supplierIngredientLinks.length ||
      !scenario.orders.length ||
      !scenario.stations.length ||
      !sameStringSet(
        scenario.supplierIngredientLinks.map((link) => link.supplier_id),
        miseboxDemoSupplierIds
      )
  )
) {
  throw new Error(
    'The Misebox Demo World requires exactly three operational Kitchens connected to the same three Suppliers.'
  )
}

export type { KitchenDemoScenario } from './core/types'
