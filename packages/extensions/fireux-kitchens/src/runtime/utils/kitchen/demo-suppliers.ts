import type { KitchenSupplierIngredient } from '../../models/kitchen/supplier-ingredient.model'

const clean = (value: unknown) => String(value ?? '').trim()
const cleanList = (value: unknown) =>
  Array.isArray(value) ? value.map(clean).filter(Boolean) : []

export type KitchenDemoSupplierScenarioLike = {
  supplier: {
    id?: string | null
    supplier_organization_name?: string | null
    supplier_headline?: string | null
    supplier_image?: string | null
    supplier_item_categories?: readonly string[] | null
    supplier_delivery_areas?: readonly string[] | null
  }
  ingredients: readonly {
    ingredient_id?: string | null
    supplier_id?: string | null
    active?: boolean | null
  }[]
  catalogues: readonly {
    id?: string | null
  }[]
}

export type KitchenDemoSupplierSummary = {
  id: string
  name: string
  headline: string
  imageUrl: string
  categories: string[]
  deliveryAreas: string[]
  linkedIngredientCount: number
  catalogueCount: number
}

type KitchenDemoSupplierSelectionInput<
  TScenario extends KitchenDemoSupplierScenarioLike,
> = {
  links: readonly KitchenSupplierIngredient[]
  supplierScenarios: readonly TScenario[]
}

export function selectKitchenDemoSupplierScenarios<
  TScenario extends KitchenDemoSupplierScenarioLike,
>(
  input: KitchenDemoSupplierSelectionInput<TScenario>
): TScenario[] {
  const selectedSupplierIds = new Set(
    input.links
      .map(link => clean(link.supplier_id))
      .filter(Boolean)
  )

  return input.supplierScenarios.filter(scenario =>
    selectedSupplierIds.has(clean(scenario.supplier.id))
  )
}

/**
 * Resolves Kitchen-owned usage links against Supplier-owned Demo identity and
 * coverage without copying Supplier truth into the Kitchen fixture.
 */
export function buildKitchenDemoSuppliersOperation(
  input: KitchenDemoSupplierSelectionInput<KitchenDemoSupplierScenarioLike>
): { items: KitchenDemoSupplierSummary[] } {
  const supplierIds = [
    ...new Set(input.links.map(link => clean(link.supplier_id))),
  ]
  if (
    supplierIds.some(id => !id)
    || supplierIds.length === 0
  ) {
    throw new Error('Kitchen Demo Suppliers require valid usage links.')
  }

  const selectedScenarios = selectKitchenDemoSupplierScenarios(input)
  const selectedScenarioIds = selectedScenarios.map(
    scenario => clean(scenario.supplier.id)
  )
  if (
    new Set(selectedScenarioIds).size !== selectedScenarioIds.length
    || selectedScenarios.length !== supplierIds.length
  ) {
    throw new Error(
      'Kitchen Demo Suppliers must resolve each linked Supplier exactly once.'
    )
  }

  const scenarioById = new Map(
    selectedScenarios.map(scenario => [
      clean(scenario.supplier.id),
      scenario,
    ])
  )
  const items = supplierIds.map((supplierId) => {
    const scenario = scenarioById.get(supplierId)
    if (!scenario) {
      throw new Error(`Kitchen Demo Supplier is unresolved: ${supplierId}`)
    }

    const linkedIngredientIds = input.links
      .filter(link => clean(link.supplier_id) === supplierId)
      .map(link => clean(link.ingredient_id))
    const linkedIngredientIdSet = new Set(linkedIngredientIds)
    if (
      linkedIngredientIdSet.size !== linkedIngredientIds.length
      || linkedIngredientIds.some(id => !id)
    ) {
      throw new Error(
        `Kitchen Demo Supplier links are invalid: ${supplierId}`
      )
    }

    const coveredIngredientIds = new Set(
      scenario.ingredients
        .filter(ingredient =>
          ingredient.active !== false
          && clean(ingredient.supplier_id) === supplierId
        )
        .map(ingredient => clean(ingredient.ingredient_id))
        .filter(Boolean)
    )
    const unresolvedIngredientIds = linkedIngredientIds.filter(
      ingredientId => !coveredIngredientIds.has(ingredientId)
    )
    if (unresolvedIngredientIds.length) {
      throw new Error(
        `Kitchen Demo Supplier coverage is unresolved: ${
          supplierId
        }:${unresolvedIngredientIds.join(',')}`
      )
    }

    const name = clean(scenario.supplier.supplier_organization_name)
    if (!name) {
      throw new Error(`Kitchen Demo Supplier has no name: ${supplierId}`)
    }

    return {
      id: supplierId,
      name,
      headline: clean(scenario.supplier.supplier_headline),
      imageUrl: clean(scenario.supplier.supplier_image),
      categories: cleanList(scenario.supplier.supplier_item_categories),
      deliveryAreas: cleanList(
        scenario.supplier.supplier_delivery_areas
      ),
      linkedIngredientCount: linkedIngredientIdSet.size,
      catalogueCount: scenario.catalogues.length,
    }
  })

  return {
    items: items.sort((left, right) =>
      left.name.localeCompare(right.name, undefined, {
        sensitivity: 'base',
      })
    ),
  }
}
