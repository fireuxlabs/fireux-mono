import type {
  SupplierIngredient,
  SupplierItem,
} from 'fireux-suppliers/runtime/models/supplier/Supplier.model'
import type { Dish } from '../../models/kitchen/dish.model'
import type { PublicIngredient } from '../../models/ingredient-public.model'
import type { KitchenDemoScenario } from '../../demo/kitchen/core/types'
import type {
  KitchenDemoDishSpec,
  KitchenDemoMiseRequirement,
  KitchenDemoPrepItem,
  KitchenDemoProductionRecipe,
} from '../../demo/kitchen/production'
import {
  estimateKitchenDishFinance,
  type KitchenDishFinanceEstimate,
  type KitchenDishFinanceSupplyLine,
} from './dish-finance'

const clean = (value: unknown) => String(value ?? '').trim()

export type KitchenDemoDishMenuUsage = {
  dishId: string
  menuId: string
  sectionId: string
  itemId: string
  price?: number
  currencyCode?: string
  menuName?: string
  sectionLabel?: string
  active?: boolean
}

export type KitchenDemoDishSection = {
  id: string
  label: string
  dishIds: string[]
  count: number
}

export type KitchenDemoDishComponentView = {
  id: string
  name: string
  amount: string
  sourceLabel: 'Ingredient' | 'Prep item' | 'Recipe'
}

export type KitchenDemoDishOperationItem = {
  dish: Dish
  spec: KitchenDemoDishSpec | null
  componentViews: KitchenDemoDishComponentView[]
  menuUsage: KitchenDemoDishMenuUsage[]
  prepItems: KitchenDemoPrepItem[]
  recipes: KitchenDemoProductionRecipe[]
  miseRequirements: KitchenDemoMiseRequirement[]
  finance: KitchenDishFinanceEstimate | null
  quantitySold: number | null
  totalSalesMinor: number | null
}

export type KitchenDemoDishesOperation = {
  dishes: Dish[]
  ingredientNameById: Record<string, string>
  stationNameById: Record<string, string>
  items: KitchenDemoDishOperationItem[]
  sections: KitchenDemoDishSection[]
}

export type KitchenDemoDishesSupplierScenario = {
  supplier: {
    id?: string | null
    supplier_organization_name?: string | null
  }
  ingredients: readonly SupplierIngredient[]
  items: readonly SupplierItem[]
}

type KitchenDemoDishesScenario = Pick<
  KitchenDemoScenario,
  | 'dishFinance'
  | 'dishes'
  | 'dishSpecs'
  | 'kitchenIngredients'
  | 'menus'
  | 'miseRequirements'
  | 'place'
  | 'prepItems'
  | 'recipes'
  | 'stations'
  | 'supplierIngredientLinks'
>

const formatProductionAmount = (amount: {
  quantity: number
  unit: string
}) => {
  const quantity = Number(amount.quantity)
  const unit = clean(amount.unit)
  if (!Number.isFinite(quantity) || !unit) return ''
  const quantityLabel = new Intl.NumberFormat('en-CH', {
    maximumFractionDigits: 2,
  }).format(quantity)
  return `${quantityLabel} ${
    unit === 'portion' && quantity !== 1 ? 'portions' : unit
  }`
}

const resolveSupplyLines = (
  scenario: KitchenDemoDishesScenario,
  supplierScenarios: readonly KitchenDemoDishesSupplierScenario[],
  ingredientRoots: readonly PublicIngredient[]
) => {
  const supplierScenarioById = new Map(
    supplierScenarios.map(item => [clean(item.supplier.id), item])
  )
  const ingredientById = new Map(
    ingredientRoots.map(ingredient => [clean(ingredient.id), ingredient])
  )
  const entries = scenario.supplierIngredientLinks.flatMap((link) => {
    const ingredientId = clean(link.ingredient_id)
    const supplierId = clean(link.supplier_id)
    const ingredient = ingredientById.get(ingredientId)
    const supplierScenario = supplierScenarioById.get(supplierId)
    const supplierIngredients = supplierScenario?.ingredients.filter(item =>
      item.active !== false
      && clean(item.ingredient_id) === ingredientId
      && clean(item.supplier_id) === supplierId
    ) ?? []
    const supplierIngredient = supplierIngredients.length === 1
      ? supplierIngredients[0]
      : undefined
    const preferredProductId = clean(supplierIngredient?.preferred_product_id)
    const offers = supplierScenario?.items.filter(item =>
      item.active !== false
      && item.availability_state !== 'unavailable'
      && clean(item.ingredient_id) === ingredientId
      && clean(item.product_id) === preferredProductId
      && clean(item.supplier_id) === supplierId
      && Number(item.quantity_per_pack) > 0
      && Number(item.pack_cost_minor) > 0
      && /^[A-Z]{3}$/.test(clean(item.currency_code))
    ) ?? []
    const supplierItem = offers.length === 1 ? offers[0] : undefined

    return ingredient && supplierScenario && supplierItem
      ? [[
          ingredientId,
          { ingredient, supplierScenario, supplierItem },
        ] as const]
      : []
  })

  return new Map<string, KitchenDishFinanceSupplyLine>(entries)
}

export function buildKitchenDemoDishesOperation(input: {
  scenario: KitchenDemoDishesScenario
  supplierScenarios: readonly KitchenDemoDishesSupplierScenario[]
  ingredientRoots: readonly PublicIngredient[]
}): KitchenDemoDishesOperation {
  const { scenario } = input
  const projectedDishIds = scenario.menus.flatMap(menu =>
    menu.dishes.map(dish => clean(dish.id))
  )
  const duplicateProjectedDishIds = projectedDishIds.filter(
    (dishId, index) => projectedDishIds.indexOf(dishId) !== index
  )
  const scenarioDishIds = scenario.dishes.map(dish => clean(dish.id))
  const specDishIds = scenario.dishSpecs.map(spec => clean(spec.dishId))
  const financeDishIds = scenario.dishFinance.map(entry => clean(entry.dishId))
  const duplicates = (ids: string[]) =>
    ids.filter((id, index) => ids.indexOf(id) !== index)
  const projectedDishIdSet = new Set(projectedDishIds)
  const scenarioDishIdSet = new Set(scenarioDishIds)
  const missingProjectedDishes = projectedDishIds.filter(
    dishId => !scenarioDishIdSet.has(dishId)
  )
  const missingSpecs = scenario.dishSpecs.length
    ? projectedDishIds.filter(dishId => !specDishIds.includes(dishId))
    : []
  const unprojectedSpecs = specDishIds.filter(
    dishId => !projectedDishIdSet.has(dishId)
  )
  const unknownFinance = financeDishIds.filter(
    dishId => !projectedDishIdSet.has(dishId)
  )
  const identityErrors = [
    ...duplicateProjectedDishIds,
    ...duplicates(scenarioDishIds),
    ...duplicates(specDishIds),
    ...duplicates(financeDishIds),
    ...missingProjectedDishes,
    ...missingSpecs,
    ...unprojectedSpecs,
    ...unknownFinance,
  ]
  if (identityErrors.length) {
    throw new Error(
      `Kitchen Demo Dishes identity coverage is incoherent: ${
        [...new Set(identityErrors)].join(', ')
      }`
    )
  }

  const currencyCode =
    clean(scenario.place.default_currency_code).toUpperCase() || 'CHF'
  const specByDishId = new Map(
    scenario.dishSpecs.map(spec => [clean(spec.dishId), spec])
  )
  const ingredientNameById = new Map(
    input.ingredientRoots.map(ingredient => [
      clean(ingredient.id),
      clean(ingredient.name),
    ])
  )
  const prepItemById = new Map(
    scenario.prepItems.map(item => [clean(item.id), item])
  )
  const recipeById = new Map(
    scenario.recipes.map(recipe => [clean(recipe.id), recipe])
  )
  const stationNameById = new Map(
    scenario.stations.map(station => [clean(station.id), clean(station.name)])
  )
  const financeByDishId = new Map(
    scenario.dishFinance.map(entry => [clean(entry.dishId), entry])
  )
  const supplyLineByIngredientId = resolveSupplyLines(
    scenario,
    input.supplierScenarios,
    input.ingredientRoots
  )
  const menuUsageByDishId = new Map<string, KitchenDemoDishMenuUsage[]>()

  for (const menu of scenario.menus) {
    for (const { section, items } of menu.menuSections) {
      for (const item of items) {
        const dishId = clean(item.dish_id)
        if (!dishId) continue
        const prices = [
          Number(item.price),
          ...item.price_options.map(option => Number(option.price)),
        ].filter(price => Number.isFinite(price) && price > 0)
        const entries = menuUsageByDishId.get(dishId) ?? []
        entries.push({
          dishId,
          menuId: menu.kitchenMenu.id,
          sectionId: section.id,
          itemId: item.id,
          ...(prices.length ? { price: Math.min(...prices) } : {}),
          currencyCode,
          menuName: menu.kitchenMenu.name,
          sectionLabel: section.label,
          active: item.status === 'active' && section.status === 'active',
        })
        menuUsageByDishId.set(dishId, entries)
      }
    }
  }

  const items = scenario.dishes.map((dish): KitchenDemoDishOperationItem => {
    const dishId = clean(dish.id)
    const spec = specByDishId.get(dishId) ?? null
    const menuUsage = menuUsageByDishId.get(dishId) ?? []
    const prepItemIds = new Set(
      spec?.components
        .filter(component => component.source === 'prep_item')
        .map(component => clean(component.prepItemId)) ?? []
    )
    const recipeIds = new Set(
      spec?.components
        .filter(component => component.source === 'recipe')
        .map(component => clean(component.recipeId)) ?? []
    )
    const componentSourceKeys = new Set([
      ...[...prepItemIds].map(id => `prep_item:${id}`),
      ...[...recipeIds].map(id => `recipe:${id}`),
    ])
    const componentViews = spec?.components.map((component) => {
      if (component.source === 'ingredient') {
        const ingredientId = clean(component.ingredientId)
        return {
          id: clean(component.id),
          name: ingredientNameById.get(ingredientId) || ingredientId,
          amount: formatProductionAmount(component),
          sourceLabel: 'Ingredient' as const,
        }
      }
      if (component.source === 'prep_item') {
        const prepItemId = clean(component.prepItemId)
        return {
          id: clean(component.id),
          name: clean(prepItemById.get(prepItemId)?.name) || prepItemId,
          amount: formatProductionAmount(component),
          sourceLabel: 'Prep item' as const,
        }
      }
      const recipeId = clean(component.recipeId)
      return {
        id: clean(component.id),
        name: clean(recipeById.get(recipeId)?.name) || recipeId,
        amount: formatProductionAmount(component),
        sourceLabel: 'Recipe' as const,
      }
    }) ?? []
    const prepItems = scenario.prepItems.filter(item =>
      prepItemIds.has(clean(item.id))
    )
    const recipes = scenario.recipes.filter(recipe =>
      recipeIds.has(clean(recipe.id))
    )
    const miseRequirements = scenario.miseRequirements.filter((requirement) => {
      const sourceKey = requirement.source.kind === 'prep_item'
        ? `prep_item:${clean(requirement.source.prepItemId)}`
        : `recipe:${clean(requirement.source.recipeId)}`
      return componentSourceKeys.has(sourceKey)
    })
    const finance = spec
      ? estimateKitchenDishFinance({
          dishSpec: spec,
          menuUsage,
          scenario,
          supplyLineByIngredientId,
        })
      : null
    const demoFinance = financeByDishId.get(dishId)
    const quantitySold = demoFinance?.quantitySold ?? null
    const totalSalesMinor =
      finance?.sellingPriceMinor !== null
      && finance?.sellingPriceMinor !== undefined
      && quantitySold !== null
        ? finance.sellingPriceMinor * quantitySold
        : null
    const financeArithmeticReconciles = Boolean(
      finance
      && finance.sellingPriceMinor !== null
      && finance.grossProfitMinor !== null
      && finance.grossProfitMinor
        === finance.sellingPriceMinor - finance.costOfSalesMinor
    )
    const financePercentagesReconcile = Boolean(
      finance
      && finance.sellingPriceMinor
      && finance.grossProfitMinor !== null
      && finance.foodCostPercentage !== null
      && finance.grossMarginPercentage !== null
      && Math.abs(
        finance.foodCostPercentage
        - finance.costOfSalesMinor / finance.sellingPriceMinor * 100
      ) < 1e-9
      && Math.abs(
        finance.grossMarginPercentage
        - finance.grossProfitMinor / finance.sellingPriceMinor * 100
      ) < 1e-9
      && Math.abs(
        finance.foodCostPercentage + finance.grossMarginPercentage - 100
      ) < 1e-9
    )
    const hasUnknownComponent = spec?.components.some((component) => {
      if (component.source === 'ingredient') {
        return !ingredientNameById.has(clean(component.ingredientId))
      }
      if (component.source === 'prep_item') {
        return !prepItemById.has(clean(component.prepItemId))
      }
      return !recipeById.has(clean(component.recipeId))
    }) ?? false

    if (
      demoFinance
      && (
        !spec
        || hasUnknownComponent
        || !finance?.complete
        || finance.resolvedRequirementCount !== finance.requirementCount
        || ![
          finance.sellingPriceMinor,
          finance.costOfSalesMinor,
          finance.grossProfitMinor,
        ].every(value =>
          typeof value === 'number'
          && Number.isSafeInteger(value)
          && value >= 0
        )
        || Number(finance.sellingPriceMinor) <= 0
        || ![
          finance.foodCostPercentage,
          finance.grossMarginPercentage,
        ].every(value =>
          typeof value === 'number'
          && Number.isFinite(value)
          && value >= 0
        )
        || !financeArithmeticReconciles
        || !financePercentagesReconcile
        || !Number.isSafeInteger(quantitySold)
        || Number(quantitySold) <= 0
        || !Number.isSafeInteger(totalSalesMinor)
        || totalSalesMinor
          !== Number(finance.sellingPriceMinor) * Number(quantitySold)
      )
    ) {
      throw new Error(
        `Kitchen Demo Dish operation projection is incomplete: ${dishId}`
      )
    }

    return {
      dish,
      spec,
      componentViews,
      menuUsage,
      prepItems,
      recipes,
      miseRequirements,
      finance,
      quantitySold,
      totalSalesMinor,
    }
  })

  return {
    dishes: items.map(item => item.dish),
    ingredientNameById: Object.fromEntries(ingredientNameById),
    stationNameById: Object.fromEntries(stationNameById),
    items,
    sections: scenario.menus.flatMap(menu =>
      menu.menuSections.map(({ section, items: menuItems }) => ({
        id: `${menu.kitchenMenu.id}:${section.id}`,
        label: `${menu.kitchenMenu.name} · ${section.label}`,
        dishIds: menuItems.map(item => clean(item.dish_id)).filter(Boolean),
        count: menuItems.length,
      }))
    ),
  }
}
