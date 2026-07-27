// Concurrent edit — 2026-07-22 13:15 CEST — Demo World pass: replace disconnected target fixtures with one coherent fictional Kitchen world.
// Concurrent edit — 2026-07-22 12:40 CEST — Demo World correction: preserve Deanos and Garden Room as two coherent Demo worlds.
// Concurrent edit — 2026-07-22 14:12 CEST — Demo surface selectors: name the Menu, Kiosk and Service scenarios independently.
// Concurrent edit — 2026-07-22 13:11 CEST — Demo Kitchen identity pass: default to Misebox Restaurant and retain Deanos Smash Burger as the service contrast.
// Concurrent edit — 2026-07-22 13:48 CEST — Kiosk Demo selector pass: give each Demo Kitchen a distinct package-owned Menu theme.
// Concurrent edit — 2026-07-22 13:56 CEST — Kiosk theme contrast pass: separate refined dining from bold counter-service typography and colour.
// Concurrent edit — 2026-07-22 18:03 CEST — Deanos modernisation pass: align the Demo brand palette and typography with its new campaign photography.
// Concurrent edit — 2026-07-22 18:12 CEST — Pizza Demo pass: add a reusable green-and-yellow pizzeria presentation world.
import type { Place } from 'fireux-places/runtime/models/place.model.ts'
import type { Kitchen } from '../../models/kitchen.model'
import { KITCHEN_MISE_WORKFLOW_STAGES } from '../../models/kitchen/mise.model'
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
import {
  deanosKitchenDemoTarget,
  miseboxRestaurantKitchenDemoTarget,
  pizzaTheActionKitchenDemoTarget,
} from './core/targets'
import {
  deanosKitchenDemoFinance,
  type KitchenDemoFinance,
} from './finance'
import {
  deanosKitchenDemoDishFinance,
  type KitchenDemoDishFinance,
} from './operations/Dishes/finance'
import {
  deanosKitchenDemoIngredientLinks,
  deanosKitchenDemoSupplierIngredientLinks,
  miseboxRestaurantKitchenDemoIngredientLinks,
  miseboxRestaurantKitchenDemoSupplierIngredientLinks,
  pizzaTheActionKitchenDemoIngredientLinks,
  pizzaTheActionKitchenDemoSupplierIngredientLinks,
} from './operations/Ingredients'
import {
  deanosKitchenDemoMiseTasks,
  deanosKitchenDemoOrders,
  deanosKitchenDemoStations,
  miseboxRestaurantKitchenDemoMiseTasks,
  miseboxRestaurantKitchenDemoOrders,
  miseboxRestaurantKitchenDemoStations,
  pizzaTheActionKitchenDemoMiseTasks,
  pizzaTheActionKitchenDemoOrders,
  pizzaTheActionKitchenDemoStations,
} from './operations'
import {
  deanosKitchenDemoMise,
  deanosKitchenDemoMenuItemComponentDeltas,
  deanosKitchenDemoPrepItems,
  deanosKitchenDemoRecipes,
  deanosKitchenDemoSpecs,
  type KitchenDemoDishSpec,
  type KitchenDemoMenuItemComponentDelta,
  type KitchenDemoMiseRequirement,
  type KitchenDemoPrepItem,
  type KitchenDemoProductionRecipe,
} from './production'
import type {
  KitchenDemoIdentity,
  KitchenDemoMenu,
  KitchenDemoScenario,
  KitchenDemoScenarioDescriptor,
} from './core/types'
import {
  KITCHEN_DEMO_MENU_MODES,
  type KitchenDemoMenuMode,
} from '../../utils/kitchen/demo-menu-cascade'
import { projectKitchenDemoFinanceReport } from '../../utils/kitchen/demo-finance'

const scenario = (input: {
  identity: KitchenDemoIdentity
  kitchen: Kitchen
  place: Place
  menu: KitchenDemoMenu
  menuModes?: Readonly<Record<string, KitchenDemoMenuMode>>
  additionalMenus?: KitchenDemoMenu[]
  dishSpecs?: KitchenDemoDishSpec[]
  dishFinance?: KitchenDemoDishFinance[]
  finance?: KitchenDemoFinance
  kitchenIngredients?: KitchenDemoScenario['kitchenIngredients']
  menuItemComponentDeltas?: KitchenDemoMenuItemComponentDelta[]
  miseRequirements?: KitchenDemoMiseRequirement[]
  orders: KitchenDemoScenario['orders']
  prepItems?: KitchenDemoPrepItem[]
  recipes?: KitchenDemoProductionRecipe[]
  stations: KitchenDemoScenario['stations']
  supplierIngredientLinks?: KitchenDemoScenario['supplierIngredientLinks']
  miseTasks: KitchenDemoScenario['miseTasks']
}): KitchenDemoScenario => {
  const menus = [input.menu, ...(input.additionalMenus ?? [])]
  const menuModes = Object.fromEntries(
    menus.map((menu) => {
      const menuId = String(menu.kitchenMenu.id || '').trim()
      return [menuId, input.menuModes?.[menuId] ?? 'on']
    })
  ) satisfies Record<string, KitchenDemoMenuMode>
  const kitchenIngredients = [...(input.kitchenIngredients ?? [])]
  const supplierIngredientLinks = [...(input.supplierIngredientLinks ?? [])]
  const dishSpecs = [...(input.dishSpecs ?? [])]
  const dishFinance = [...(input.dishFinance ?? [])]
  const finance = input.finance ?? null
  const menuItemComponentDeltas = [
    ...(input.menuItemComponentDeltas ?? []),
  ]
  const prepItems = [...(input.prepItems ?? [])]
  const recipes = [...(input.recipes ?? [])]
  const dishes = new Map(
    menus
      .flatMap(menu => menu.dishes)
      .map(dish => [dish.id, dish])
  )
  const ingredientIds = new Set(
    kitchenIngredients.map(ingredient => ingredient.ingredient_id)
  )
  const hasDuplicateIngredients =
    ingredientIds.size !== kitchenIngredients.length
  const hasInvalidSupplierLink = supplierIngredientLinks.some(
    link =>
      link.kitchen_id !== input.identity.kitchenId ||
      !ingredientIds.has(link.ingredient_id) ||
      !link.supplier_id
  )
  const hasInvalidRecipeLine = recipes.some(recipe =>
    !Number.isFinite(recipe.yield.quantity)
    || recipe.yield.quantity <= 0
    || recipe.ingredients.some(
      ingredient =>
        !ingredientIds.has(ingredient.ingredientId) ||
        !Number.isFinite(ingredient.quantity) ||
        ingredient.quantity <= 0
    )
  )
  const prepItemIds = new Set(prepItems.map(prepItem => prepItem.id))
  const recipeIds = new Set(recipes.map(recipe => recipe.id))
  const menuIds = new Set(menus.map(menu => menu.kitchenMenu.id))
  const hasInvalidMenuMode =
    Object.keys(input.menuModes ?? {}).some(menuId => !menuIds.has(menuId))
    || Object.values(menuModes).some(mode =>
      !KITCHEN_DEMO_MENU_MODES.includes(mode)
    )
  const stationIds = new Set(input.stations.map(station => station.id))
  const dishSpecDishIds = dishSpecs.map(spec => spec.dishId)
  const hasDuplicateProductionIds =
    prepItemIds.size !== prepItems.length
    || recipeIds.size !== recipes.length
    || new Set(dishSpecDishIds).size !== dishSpecDishIds.length
  const hasInvalidPrepItem = prepItems.some(prepItem =>
    !ingredientIds.has(prepItem.input.ingredientId)
    || !Number.isFinite(prepItem.input.quantity)
    || prepItem.input.quantity <= 0
    || !Number.isFinite(prepItem.yield.quantity)
    || prepItem.yield.quantity <= 0
  )
  const hasInvalidDishSpec = dishSpecs.some(spec => {
    if (!dishes.has(spec.dishId)) return true

    const componentIds = new Set(spec.components.map(component => component.id))
    if (componentIds.size !== spec.components.length) return true

    return spec.components.some((component) => {
      if (!Number.isFinite(component.quantity) || component.quantity <= 0) {
        return true
      }
      if (component.source === 'ingredient') {
        return !ingredientIds.has(component.ingredientId)
      }
      if (component.source === 'prep_item') {
        return !prepItemIds.has(component.prepItemId)
      }
      return !recipeIds.has(component.recipeId)
    })
  })
  const menuItemByScopedId = new Map(
    menus.flatMap(menu =>
      menu.menuSections.flatMap(({ section, items }) =>
        items.map(item => [
          `${menu.kitchenMenu.id}:${section.id}:${item.id}`,
          item,
        ] as const)
      )
    )
  )
  const menuItemDeltaIds = new Set(
    menuItemComponentDeltas.map(delta => delta.id)
  )
  const hasInvalidMenuItemDelta =
    menuItemDeltaIds.size !== menuItemComponentDeltas.length
    || menuItemComponentDeltas.some((delta) => {
      const item = menuItemByScopedId.get(
        `${delta.menuId}:${delta.sectionId}:${delta.menuItemId}`
      )
      if (!item) return true

      const hasChoice = delta.choice.kind === 'price_option'
        ? Boolean(delta.choice.id) && item.price_options.some(
            option => option.label === delta.choice.label
          )
        : item.add_ons.some(addOn => addOn.id === delta.choice.id)
      if (!hasChoice) return true

      const componentIds = new Set(
        delta.components.map(component => component.id)
      )
      if (componentIds.size !== delta.components.length) return true

      return delta.components.some((component) => {
        if (!Number.isFinite(component.quantity) || component.quantity <= 0) {
          return true
        }
        if (component.source === 'ingredient') {
          return !ingredientIds.has(component.ingredientId)
        }
        if (component.source === 'prep_item') {
          return !prepItemIds.has(component.prepItemId)
        }
        return !recipeIds.has(component.recipeId)
      })
    })
  const hasIncompleteDishSpecs =
    dishSpecs.length > 0
    && (
      dishSpecs.length !== dishes.size
      || [...dishes.keys()].some(dishId => !dishSpecDishIds.includes(dishId))
    )
  const dishFinanceDishIds = dishFinance.map(entry => entry.dishId)
  const hasInvalidDishFinance =
    new Set(dishFinanceDishIds).size !== dishFinanceDishIds.length
    || dishFinance.some(entry =>
      !dishes.has(entry.dishId)
      || !Number.isSafeInteger(entry.quantitySold)
      || entry.quantitySold <= 0
    )
    || (
      dishFinance.length > 0
      && (
        dishFinance.length !== dishes.size
        || [...dishes.keys()].some(
          dishId => !dishFinanceDishIds.includes(dishId)
        )
      )
    )
  const hasInvalidFinance = (() => {
    if (!finance) {
      return false
    }

    try {
      projectKitchenDemoFinanceReport(finance, '90d')
      return false
    } catch {
      return true
    }
  })()
  const hasInvalidMiseRequirement = (input.miseRequirements ?? []).some(
    requirement => {
      if (
        !Number.isFinite(requirement.amount.quantity)
        || requirement.amount.quantity <= 0
      ) {
        return true
      }
      return requirement.source.kind === 'prep_item'
        ? !prepItemIds.has(requirement.source.prepItemId)
        : !recipeIds.has(requirement.source.recipeId)
    }
  )
  const hasInvalidStation =
    stationIds.size !== input.stations.length
    || input.stations.some(station =>
      station.kitchen_id !== input.identity.kitchenId
      || !station.id
      || !station.name
    )
  const hasInvalidOrder = input.orders.some(order =>
    order.kitchen_id !== input.identity.kitchenId
    || !menuIds.has(order.menu_id)
    || !order.items.length
    || order.items.some(item => !dishes.has(item.dish_id))
  )
  const miseTaskIds = new Set(input.miseTasks.map(task => task.id))
  const hasInvalidMiseTask =
    miseTaskIds.size !== input.miseTasks.length
    || input.miseTasks.some((task) => {
      const checklistIds = task.checklist.map(item => item.id)
      return task.kitchen_id !== input.identity.kitchenId
        || !task.id
        || !menuIds.has(task.menu_id)
        || !stationIds.has(task.station)
        || Boolean(
          task.workflow_stage
          && !KITCHEN_MISE_WORKFLOW_STAGES.includes(task.workflow_stage)
        )
        || task.ingredient_ids.some(id => !ingredientIds.has(id))
        || task.mise_ids.some(id => !prepItemIds.has(id))
        || Boolean(task.recipe_id && !recipeIds.has(task.recipe_id))
        || new Set(checklistIds).size !== checklistIds.length
        || task.checklist.some(item => !item.id || !item.label)
    })

  if (
    hasDuplicateIngredients ||
    hasInvalidMenuMode ||
    hasInvalidSupplierLink ||
    hasInvalidRecipeLine ||
    hasDuplicateProductionIds ||
    hasInvalidPrepItem ||
    hasInvalidDishSpec ||
    hasInvalidMenuItemDelta ||
    hasIncompleteDishSpecs ||
    hasInvalidDishFinance ||
    hasInvalidFinance ||
    hasInvalidMiseRequirement ||
    hasInvalidStation ||
    hasInvalidOrder ||
    hasInvalidMiseTask
  ) {
    throw new Error(
      `Kitchen Demo production relationships are invalid for ${input.identity.kitchenId}.`
    )
  }

  return {
    appId: input.identity.appId,
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
    menuItemComponentDeltas,
    menuSections: input.menu.menuSections,
    miseRequirements: [...(input.miseRequirements ?? [])],
    orders: input.orders,
    prepItems,
    recipes,
    stations: input.stations,
    miseTasks: input.miseTasks,
  }
}

export const deanosKitchenDemoScenario = scenario({
  identity: deanosKitchenDemoIdentity,
  kitchen: deanosKitchenDemoTarget.kitchen,
  place: deanosKitchenDemoTarget.place,
  menu: deanosKitchenDemoMenu,
  menuModes: deanosKitchenDemoMenuModes,
  additionalMenus: [
    deanosPartyDemoMenu,
    deanosXmasDemoMenu,
  ],
  dishSpecs: deanosKitchenDemoSpecs,
  dishFinance: deanosKitchenDemoDishFinance,
  finance: deanosKitchenDemoFinance,
  kitchenIngredients: deanosKitchenDemoIngredientLinks,
  menuItemComponentDeltas: deanosKitchenDemoMenuItemComponentDeltas,
  miseRequirements: deanosKitchenDemoMise,
  orders: deanosKitchenDemoOrders,
  prepItems: deanosKitchenDemoPrepItems,
  recipes: deanosKitchenDemoRecipes,
  stations: deanosKitchenDemoStations,
  supplierIngredientLinks: deanosKitchenDemoSupplierIngredientLinks,
  miseTasks: deanosKitchenDemoMiseTasks,
})

export const pizzaTheActionKitchenDemoScenario = scenario({
  identity: pizzaTheActionKitchenDemoIdentity,
  kitchen: pizzaTheActionKitchenDemoTarget.kitchen,
  place: pizzaTheActionKitchenDemoTarget.place,
  menu: pizzaTheActionKitchenDemoMenu,
  kitchenIngredients: pizzaTheActionKitchenDemoIngredientLinks,
  orders: pizzaTheActionKitchenDemoOrders,
  stations: pizzaTheActionKitchenDemoStations,
  supplierIngredientLinks: pizzaTheActionKitchenDemoSupplierIngredientLinks,
  miseTasks: pizzaTheActionKitchenDemoMiseTasks,
})

export const miseboxRestaurantKitchenDemoScenario = scenario({
  identity: miseboxRestaurantKitchenDemoIdentity,
  kitchen: miseboxRestaurantKitchenDemoTarget.kitchen,
  place: miseboxRestaurantKitchenDemoTarget.place,
  menu: miseboxRestaurantKitchenDemoMenu,
  kitchenIngredients: miseboxRestaurantKitchenDemoIngredientLinks,
  orders: miseboxRestaurantKitchenDemoOrders,
  stations: miseboxRestaurantKitchenDemoStations,
  supplierIngredientLinks:
    miseboxRestaurantKitchenDemoSupplierIngredientLinks,
  miseTasks: miseboxRestaurantKitchenDemoMiseTasks,
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
      'mise',
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
      'mise',
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
      'mise',
      'orders',
      'stations',
      'suppliers',
      'tables',
    ],
    presentation: ['menu', 'kiosk', 'service'],
  },
]

const scenarioIds = kitchenDemoScenarios.map(value => value.kitchen.id).sort()
const descriptorIds = kitchenDemoScenarioDescriptors
  .map(value => value.kitchenId)
  .sort()
if (
  scenarioIds.length !== descriptorIds.length
  || scenarioIds.some((value, index) => value !== descriptorIds[index])
) {
  throw new Error('Every Kitchen Demo scenario requires one maturity descriptor.')
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
    normalizedLeft.length === normalizedRight.length
    && normalizedLeft.every((value, index) => value === normalizedRight[index])
  )
}

if (
  kitchenDemoScenarios.length !== 3
  || kitchenDemoScenarios.some(scenario =>
    !scenario.menus.length
    || !scenario.dishes.length
    || !scenario.kitchenIngredients.length
    || !scenario.supplierIngredientLinks.length
    || !scenario.orders.length
    || !scenario.stations.length
    || !scenario.miseTasks.length
    || Number(scenario.kitchen.tables.count) <= 0
    || !sameStringSet(
      scenario.supplierIngredientLinks.map(link => link.supplier_id),
      miseboxDemoSupplierIds
    )
  )
) {
  throw new Error(
    'The Misebox Demo World requires exactly three operational Kitchens connected to the same three Suppliers.'
  )
}

export type { KitchenDemoScenario } from './core/types'
