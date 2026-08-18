import { KITCHEN_DEMO_MENU_MODES } from '../../utils/demo-menu-cascade'
import type {
  KitchenDemoScenarioAssembly,
  KitchenDemoScenarioInput,
} from './types'
import { createKitchenDemoValidationContext } from './validation-context'

export function validateKitchenDemoProduction(
  input: KitchenDemoScenarioInput,
  assembly: KitchenDemoScenarioAssembly
): string[] {
  const {
    menus,
    menuModes,
    kitchenIngredients,
    supplierIngredientLinks,
    dishSpecs,
    dishFinance,
    completedOrders,
    menuItemComponentDeltas,
    prepItems,
    recipes,
    dishes,
    ingredientIds,
    prepItemIds,
    recipeIds,
    menuIds,
    stationIds,
  } = createKitchenDemoValidationContext(input, assembly)
  
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
  
  const hasInvalidMenuMode =
      Object.keys(input.menuModes ?? {}).some(menuId => !menuIds.has(menuId))
      || Object.values(menuModes).some(mode =>
        !KITCHEN_DEMO_MENU_MODES.includes(mode)
      )
  
  const dishSpecDishIds = dishSpecs.map(spec => spec.dishId)
  
  const hasDuplicateProductionIds =
      prepItemIds.size !== prepItems.length
      || recipeIds.size !== recipes.length
      || new Set(dishSpecDishIds).size !== dishSpecDishIds.length
  
  const hasInvalidPrepItem = prepItems.some(prepItem =>
      !stationIds.has(prepItem.station)
      || !ingredientIds.has(prepItem.input.ingredientId)
      || !Number.isFinite(prepItem.input.quantity)
      || prepItem.input.quantity <= 0
      || !Number.isFinite(prepItem.yield.quantity)
      || prepItem.yield.quantity <= 0
    )
  
  const hasInvalidDishSpec = dishSpecs.some(spec => {
      if (!dishes.has(spec.dishId) || !stationIds.has(spec.station)) return true
  
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
        if (
          delta.componentMultiplier !== undefined
          && (
            !Number.isFinite(delta.componentMultiplier)
            || delta.componentMultiplier <= 1
            || delta.components.length > 0
          )
        ) {
          return true
        }
  
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
  
  const hasMissingMenuItemDelta =
      dishSpecs.length > 0
      && menus.some(menu =>
        menu.menuSections.some(({ section, items }) =>
          items.some((item) => {
            const baseOption = item.price_options[0]
            if (!baseOption || item.price_options.length < 2) return false
            return item.price_options.slice(1).some((option) => {
              const delta = menuItemComponentDeltas.find(candidate =>
                candidate.menuId === menu.kitchenMenu.id
                && candidate.sectionId === section.id
                && candidate.menuItemId === item.id
                && candidate.choice.kind === 'price_option'
                && candidate.choice.label === option.label
              )
              if (!delta) return true
              const multiplier = option.quantity / baseOption.quantity
              return multiplier > 1
                && delta.components.length === 0
                && delta.componentMultiplier !== multiplier
            })
          })
        )
      )
  
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
      || dishFinance.some(entry => {
        const sourceQuantity = completedOrders.reduce(
          (total, order) =>
            total + order.items
              .filter(item => item.dishId === entry.dishId)
              .reduce((quantity, item) => quantity + item.quantity, 0),
          0
        )
        return entry.quantitySold !== sourceQuantity
      })

  return [
    hasDuplicateIngredients && 'duplicate ingredients',
    hasInvalidMenuMode && 'menu modes',
    hasInvalidSupplierLink && 'supplier links',
    hasInvalidRecipeLine && 'recipe lines',
    hasDuplicateProductionIds && 'production ids',
    hasInvalidPrepItem && 'prep items',
    hasInvalidDishSpec && 'dish specs',
    hasInvalidMenuItemDelta && 'menu item deltas',
    hasMissingMenuItemDelta && 'menu item delta coverage',
    hasIncompleteDishSpecs && 'incomplete dish specs',
    hasInvalidDishFinance && 'dish finance',
  ].filter((item): item is string => Boolean(item))
}
