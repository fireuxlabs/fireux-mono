import {
  financialCurrencyMinorUnitDigits,
  financialMoneyFromDecimal,
} from 'fireux-finance/runtime/utils/money'
import type {
  KitchenDemoDishSpec,
  KitchenDemoProductionAmount,
} from '../demo/production'
import type { KitchenDemoScenario } from '../demo/core/types'

const clean = (value: unknown) => String(value ?? '').trim()

type CostRequirement = {
  id: string
  ingredientId: string
  sourceLabel: string
  quantity: number
  unit: string
}

type BaseAmount = {
  dimension: 'mass' | 'volume' | 'count'
  quantity: number
  unit: 'g' | 'ml' | 'each'
}

export type KitchenDishFinanceMenuUsage = {
  active?: boolean
  currencyCode?: string
  price?: number
}

export type KitchenDishFinanceSupplyLine = {
  ingredient: { name?: string | null }
  supplierScenario: {
    supplier: { supplier_organization_name?: string | null }
  }
  supplierItem: {
    currency_code?: string | null
    pack_cost_minor?: number | null
    pack_size_label?: string | null
    quantity_per_pack?: number | null
    unit?: string | null
  }
}

export type KitchenDishFinanceCostLine = {
  id: string
  ingredientId: string
  ingredientName: string
  sourceLabel: string
  quantity: number
  unit: string
  supplierName: string
  supplierPackLabel: string
  costMinorExact: number
}

export type KitchenDishFinanceEstimate = {
  basis: 'supplier-offer-estimate'
  currencyCode: string
  minorUnitDigits: number
  sellingPriceMinor: number | null
  sellingPriceLabel: 'Selling price' | 'From selling price'
  costOfSalesMinor: number
  grossProfitMinor: number | null
  foodCostPercentage: number | null
  grossMarginPercentage: number | null
  complete: boolean
  resolvedRequirementCount: number
  requirementCount: number
  costLines: KitchenDishFinanceCostLine[]
  unresolvedRequirementIds: string[]
}

const toBaseAmount = (
  quantityValue: unknown,
  unitValue: unknown
): BaseAmount | null => {
  const quantity = Number(quantityValue)
  const unit = clean(unitValue).toLowerCase()
  if (!Number.isFinite(quantity) || quantity <= 0) return null
  if (unit === 'kg') return { dimension: 'mass', quantity: quantity * 1000, unit: 'g' }
  if (unit === 'g') return { dimension: 'mass', quantity, unit: 'g' }
  if (unit === 'l') return { dimension: 'volume', quantity: quantity * 1000, unit: 'ml' }
  if (unit === 'ml') return { dimension: 'volume', quantity, unit: 'ml' }
  if (unit === 'each') return { dimension: 'count', quantity, unit: 'each' }
  return null
}

const scaleFactor = (
  required: KitchenDemoProductionAmount,
  produced: KitchenDemoProductionAmount
) => {
  const requiredQuantity = Number(required.quantity)
  const producedQuantity = Number(produced.quantity)
  if (
    !Number.isFinite(requiredQuantity)
    || requiredQuantity <= 0
    || !Number.isFinite(producedQuantity)
    || producedQuantity <= 0
    || clean(required.unit) !== clean(produced.unit)
  ) return null
  return requiredQuantity / producedQuantity
}

const buildRequirements = (
  spec: KitchenDemoDishSpec,
  scenario: Pick<KitchenDemoScenario, 'prepItems' | 'recipes'>
) => {
  const prepItemById = new Map(scenario.prepItems.map(item => [clean(item.id), item]))
  const recipeById = new Map(scenario.recipes.map(recipe => [clean(recipe.id), recipe]))
  const requirements: CostRequirement[] = []
  const unresolvedRequirementIds: string[] = []

  for (const component of spec.components) {
    const componentId = clean(component.id)
    if (component.source === 'ingredient') {
      requirements.push({
        id: componentId,
        ingredientId: clean(component.ingredientId),
        sourceLabel: 'Dish ingredient',
        quantity: Number(component.quantity),
        unit: clean(component.unit),
      })
      continue
    }
    if (component.source === 'prep_item') {
      const prepItem = prepItemById.get(clean(component.prepItemId))
      const factor = prepItem ? scaleFactor(component, prepItem.yield) : null
      if (!prepItem || factor === null) {
        unresolvedRequirementIds.push(componentId)
        continue
      }
      requirements.push({
        id: `${componentId}:${prepItem.input.ingredientId}`,
        ingredientId: clean(prepItem.input.ingredientId),
        sourceLabel: prepItem.name,
        quantity: Number(prepItem.input.quantity) * factor,
        unit: clean(prepItem.input.unit),
      })
      continue
    }
    const recipe = recipeById.get(clean(component.recipeId))
    const factor = recipe ? scaleFactor(component, recipe.yield) : null
    if (!recipe || factor === null) {
      unresolvedRequirementIds.push(componentId)
      continue
    }
    for (const ingredient of recipe.ingredients) {
      requirements.push({
        id: `${componentId}:${ingredient.ingredientId}`,
        ingredientId: clean(ingredient.ingredientId),
        sourceLabel: recipe.name,
        quantity: Number(ingredient.quantity) * factor,
        unit: clean(ingredient.unit),
      })
    }
  }
  return { requirements, unresolvedRequirementIds }
}

export function estimateKitchenDishFinance(input: {
  dishSpec: KitchenDemoDishSpec
  menuUsage: readonly KitchenDishFinanceMenuUsage[]
  scenario: Pick<KitchenDemoScenario, 'prepItems' | 'recipes'>
  supplyLineByIngredientId: ReadonlyMap<string, KitchenDishFinanceSupplyLine>
}): KitchenDishFinanceEstimate | null {
  const { requirements, unresolvedRequirementIds: unresolvedComponents }
    = buildRequirements(input.dishSpec, input.scenario)
  const costLines: KitchenDishFinanceCostLine[] = []
  const unresolvedRequirementIds = [...unresolvedComponents]
  const currencyCodes = new Set<string>()

  for (const requirement of requirements) {
    const line = input.supplyLineByIngredientId.get(requirement.ingredientId)
    const supplierItem = line?.supplierItem
    const requiredAmount = toBaseAmount(requirement.quantity, requirement.unit)
    const packAmount = toBaseAmount(supplierItem?.quantity_per_pack, supplierItem?.unit)
    const packCostMinor = Number(supplierItem?.pack_cost_minor)
    const currencyCode = clean(supplierItem?.currency_code).toUpperCase()
    if (
      !line || !requiredAmount || !packAmount
      || requiredAmount.dimension !== packAmount.dimension
      || !Number.isSafeInteger(packCostMinor) || packCostMinor <= 0
      || !/^[A-Z]{3}$/.test(currencyCode)
    ) {
      unresolvedRequirementIds.push(requirement.id)
      continue
    }
    currencyCodes.add(currencyCode)
    costLines.push({
      id: requirement.id,
      ingredientId: requirement.ingredientId,
      ingredientName: clean(line.ingredient.name) || requirement.ingredientId,
      sourceLabel: requirement.sourceLabel,
      quantity: requiredAmount.quantity,
      unit: requiredAmount.unit,
      supplierName: clean(line.supplierScenario.supplier.supplier_organization_name),
      supplierPackLabel: clean(line.supplierItem.pack_size_label),
      costMinorExact: packCostMinor * requiredAmount.quantity / packAmount.quantity,
    })
  }

  if (currencyCodes.size !== 1 || !costLines.length) return null
  const currencyCode = [...currencyCodes][0]
  if (!currencyCode) return null
  const minorUnitDigits = financialCurrencyMinorUnitDigits(currencyCode)
  const costOfSalesMinor = Math.round(
    costLines.reduce((total, line) => total + line.costMinorExact, 0)
  )
  const matchingPrices = input.menuUsage
    .filter(usage =>
      usage.active !== false
      && clean(usage.currencyCode).toUpperCase() === currencyCode
      && Number.isFinite(Number(usage.price))
      && Number(usage.price) > 0
    )
    .map(usage => Number(usage.price))
  const sellingPrice = matchingPrices.length ? Math.min(...matchingPrices) : null
  const sellingPriceMinor = sellingPrice === null
    ? null
    : financialMoneyFromDecimal({
        amount: sellingPrice,
        currencyCode,
        minorUnitDigits,
        allowNegative: false,
        allowZero: false,
        label: 'Dish selling price',
      }).amount_minor
  const grossProfitMinor = sellingPriceMinor === null
    ? null
    : sellingPriceMinor - costOfSalesMinor

  return {
    basis: 'supplier-offer-estimate',
    currencyCode,
    minorUnitDigits,
    sellingPriceMinor,
    sellingPriceLabel: matchingPrices.length > 1 ? 'From selling price' : 'Selling price',
    costOfSalesMinor,
    grossProfitMinor,
    foodCostPercentage: sellingPriceMinor
      ? costOfSalesMinor / sellingPriceMinor * 100
      : null,
    grossMarginPercentage: sellingPriceMinor && grossProfitMinor !== null
      ? grossProfitMinor / sellingPriceMinor * 100
      : null,
    complete: unresolvedRequirementIds.length === 0,
    resolvedRequirementCount: costLines.length,
    requirementCount: requirements.length + unresolvedComponents.length,
    costLines,
    unresolvedRequirementIds,
  }
}
