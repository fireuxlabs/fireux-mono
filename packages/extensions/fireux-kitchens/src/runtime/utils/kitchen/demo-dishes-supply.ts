import type { PublicIngredient } from '../../models/ingredient-public.model'
import type { KitchenDishFinanceSupplyLine } from './dish-finance'
import type {
  KitchenDemoDishesScenario,
  KitchenDemoDishesSupplierScenario,
} from './demo-dishes.types'

export const clean = (value: unknown) => String(value ?? '').trim()

export const resolveSupplyLines = (
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
