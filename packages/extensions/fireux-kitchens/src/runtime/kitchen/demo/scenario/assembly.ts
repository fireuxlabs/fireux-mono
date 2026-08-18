import type { KitchenDemoScenarioInput } from './types'
import type { KitchenDemoMenuMode } from '../../utils/demo-menu-cascade'

export function assembleKitchenDemoScenario(
  input: KitchenDemoScenarioInput
) {
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
  
  const services = [...(input.services ?? [])]
  
  const completedOrders = [...(input.completedOrders ?? [])]
  
  const miseRequirements = [...(input.miseRequirements ?? [])]
  
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

  return {
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
  }
}
