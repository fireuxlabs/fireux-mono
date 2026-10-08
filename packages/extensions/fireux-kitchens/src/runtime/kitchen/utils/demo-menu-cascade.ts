import type { KitchenDemoDishComponent } from '../demo/production'
import type { KitchenDemoScenario } from '../demo/core/types'

export const KITCHEN_DEMO_MENU_MODES = ['on', 'order_led', 'off'] as const

export type KitchenDemoMenuMode = (typeof KITCHEN_DEMO_MENU_MODES)[number]

type KitchenDemoMenuCascadeScenario = Pick<
  KitchenDemoScenario,
  | 'menus'
  | 'dishSpecs'
  | 'menuItemComponentDeltas'
  | 'prepItems'
  | 'recipes'
  | 'kitchenIngredients'
>

export type KitchenDemoMenuCascadeInput = {
  scenario: KitchenDemoMenuCascadeScenario
  modeByMenuId: Readonly<Record<string, KitchenDemoMenuMode>>
  triggeredMenuIds?: readonly string[]
}

export type KitchenDemoMenuCascadeMenu = {
  id: string
  name: string
  mode: KitchenDemoMenuMode
  inService: boolean
  triggered: boolean
}

export type KitchenDemoMenuCascadeEntity = {
  id: string
  inServiceMenuIds: string[]
  menuIds: string[]
  neededForService: boolean
}

export type KitchenDemoMenuCascade = {
  menus: KitchenDemoMenuCascadeMenu[]
  dishes: KitchenDemoMenuCascadeEntity[]
  prepItems: KitchenDemoMenuCascadeEntity[]
  recipes: KitchenDemoMenuCascadeEntity[]
  ingredients: KitchenDemoMenuCascadeEntity[]
}

const menuModeValues = new Set<string>(KITCHEN_DEMO_MENU_MODES)

const cleanId = (value: unknown) => String(value ?? '').trim()

const addMenuUse = (
  usage: Map<string, Set<string>>,
  id: unknown,
  menuId: string
) => {
  const entityId = cleanId(id)
  if (!entityId) return

  const menuIds = usage.get(entityId) ?? new Set<string>()
  menuIds.add(menuId)
  usage.set(entityId, menuIds)
}

const projectEntity = (
  id: string,
  usage: ReadonlyMap<string, Set<string>>,
  inServiceMenuIds: ReadonlySet<string>,
  menuOrder: ReadonlyMap<string, number>
): KitchenDemoMenuCascadeEntity => {
  const sortMenuIds = (menuIds: Iterable<string>) =>
    [...menuIds].sort(
      (left, right) =>
        (menuOrder.get(left) ?? Number.MAX_SAFE_INTEGER) -
          (menuOrder.get(right) ?? Number.MAX_SAFE_INTEGER) ||
        left.localeCompare(right)
    )
  const menuIds = sortMenuIds(usage.get(id) ?? [])
  const activeMenuIds = menuIds.filter((menuId) => inServiceMenuIds.has(menuId))

  return {
    id,
    menuIds,
    inServiceMenuIds: activeMenuIds,
    neededForService: activeMenuIds.length > 0,
  }
}

/**
 * Projects operational Menu availability through the read-only Demo
 * production graph. It never mutates Menu publication records or fixtures.
 */
export function projectKitchenDemoMenuCascade(
  input: KitchenDemoMenuCascadeInput
): KitchenDemoMenuCascade {
  const menuIds = input.scenario.menus.map((menu) =>
    cleanId(menu.kitchenMenu.id)
  )
  const menuIdSet = new Set(menuIds)
  const menuOrder = new Map(menuIds.map((menuId, index) => [menuId, index]))
  const triggeredMenuIds = new Set(
    (input.triggeredMenuIds ?? []).map(cleanId).filter(Boolean)
  )

  for (const triggeredMenuId of triggeredMenuIds) {
    if (!menuIdSet.has(triggeredMenuId)) {
      throw new Error(
        `Kitchen Demo Menu trigger is unresolved: ${triggeredMenuId}`
      )
    }
  }

  const menus = input.scenario.menus.map((menu): KitchenDemoMenuCascadeMenu => {
    const id = cleanId(menu.kitchenMenu.id)
    const mode = input.modeByMenuId[id]
    if (!mode || !menuModeValues.has(mode)) {
      throw new Error(`Kitchen Demo Menu availability is unresolved: ${id}`)
    }
    const triggered = triggeredMenuIds.has(id)

    return {
      id,
      name: cleanId(menu.kitchenMenu.name) || id,
      mode,
      triggered,
      inService: mode === 'on' || (mode === 'order_led' && triggered),
    }
  })
  const inServiceMenuIds = new Set(
    menus.filter((menu) => menu.inService).map((menu) => menu.id)
  )

  const dishUsage = new Map<string, Set<string>>()
  const prepItemUsage = new Map<string, Set<string>>()
  const recipeUsage = new Map<string, Set<string>>()
  const ingredientUsage = new Map<string, Set<string>>()
  const specByDishId = new Map(
    input.scenario.dishSpecs.map((spec) => [cleanId(spec.dishId), spec])
  )
  const prepItemById = new Map(
    input.scenario.prepItems.map((prepItem) => [cleanId(prepItem.id), prepItem])
  )
  const recipeById = new Map(
    input.scenario.recipes.map((recipe) => [cleanId(recipe.id), recipe])
  )

  const addComponentUse = (
    component: KitchenDemoDishComponent,
    menuId: string
  ) => {
    if (component.source === 'ingredient') {
      addMenuUse(ingredientUsage, component.ingredientId, menuId)
      return
    }

    if (component.source === 'prep_item') {
      addMenuUse(prepItemUsage, component.prepItemId, menuId)
      const prepItem = prepItemById.get(cleanId(component.prepItemId))
      if (prepItem) {
        addMenuUse(ingredientUsage, prepItem.input.ingredientId, menuId)
      }
      return
    }

    addMenuUse(recipeUsage, component.recipeId, menuId)
    const recipe = recipeById.get(cleanId(component.recipeId))
    for (const ingredient of recipe?.ingredients ?? []) {
      addMenuUse(ingredientUsage, ingredient.ingredientId, menuId)
    }
  }

  for (const menu of input.scenario.menus) {
    const menuId = cleanId(menu.kitchenMenu.id)
    const activeItems = menu.menuSections
      .filter(({ section }) => section.status === 'active')
      .flatMap(({ items }) => items.filter((item) => item.status === 'active'))

    for (const item of activeItems) {
      const dishId = cleanId(item.dish_id)
      addMenuUse(dishUsage, dishId, menuId)
      for (const component of specByDishId.get(dishId)?.components ?? []) {
        addComponentUse(component, menuId)
      }

      for (const delta of input.scenario.menuItemComponentDeltas) {
        if (
          cleanId(delta.menuId) !== menuId ||
          cleanId(delta.menuItemId) !== cleanId(item.id)
        ) {
          continue
        }
        for (const component of delta.components) {
          addComponentUse(component, menuId)
        }
      }
    }
  }

  const uniqueIds = (values: readonly string[]) => [...new Set(values)]
  const project = (
    ids: readonly string[],
    usage: ReadonlyMap<string, Set<string>>
  ) =>
    uniqueIds(ids).map((id) =>
      projectEntity(id, usage, inServiceMenuIds, menuOrder)
    )

  const dishes = project(
    input.scenario.menus.flatMap((menu) =>
      menu.dishes.map((dish) => cleanId(dish.id))
    ),
    dishUsage
  )
  const prepItems = project(
    input.scenario.prepItems.map((prepItem) => cleanId(prepItem.id)),
    prepItemUsage
  )
  const recipes = project(
    input.scenario.recipes.map((recipe) => cleanId(recipe.id)),
    recipeUsage
  )
  const ingredients = project(
    input.scenario.kitchenIngredients.map((ingredient) =>
      cleanId(ingredient.ingredient_id)
    ),
    ingredientUsage
  )
  return {
    menus,
    dishes,
    prepItems,
    recipes,
    ingredients,
  }
}
