import type { SupplierDemoScenario } from './scenario-types'

export const sameStringSet = (left: string[], right: string[]) => {
  const normalizedLeft = [...new Set(left)].sort()
  const normalizedRight = [...new Set(right)].sort()
  return (
    normalizedLeft.length === normalizedRight.length &&
    normalizedLeft.every((value, index) => value === normalizedRight[index])
  )
}

export const validateSupplierDemoScenario = (
  scenario: SupplierDemoScenario
) => {
  const supplierId = scenario.supplier.id
  const ingredientIds = scenario.ingredients.map(
    (ingredient) => ingredient.ingredient_id
  )
  if (
    !scenario.appId ||
    !scenario.supplier.company_id ||
    scenario.supplier.identity.status !== 'active' ||
    scenario.supplier.identity.visibility !== true ||
    'place_id' in scenario.supplier ||
    scenario.supplier.management?.mode !== 'workspace' ||
    scenario.supplier.created.app_id !== scenario.appId ||
    scenario.supplier.id !== supplierId
  ) {
    throw new Error(
      `Supplier Demo ${supplierId} requires one canonical root Supplier.`
    )
  }

  if (new Set(ingredientIds).size !== ingredientIds.length) {
    throw new Error(`Supplier Demo ${supplierId} repeats a SupplierIngredient.`)
  }

  for (const ingredient of scenario.ingredients) {
    if (
      ingredient.id !== ingredient.ingredient_id ||
      ingredient.supplier_id !== supplierId ||
      ingredient.active !== true
    ) {
      throw new Error(
        `Supplier Demo ${supplierId}/${ingredient.id} has invalid coverage authority.`
      )
    }

    const matchingOffers = scenario.items.filter(
      (item) =>
        item.active === true &&
        item.supplier_id === supplierId &&
        item.ingredient_id === ingredient.ingredient_id &&
        item.product_id === ingredient.preferred_product_id
    )
    if (matchingOffers.length !== 1) {
      throw new Error(
        `Supplier Demo ${supplierId}/${ingredient.id} must resolve exactly one active preferred offer.`
      )
    }

    const [matchingOffer] = matchingOffers
    if (
      !matchingOffer ||
      !Number.isFinite(matchingOffer.quantity_per_pack) ||
      Number(matchingOffer.quantity_per_pack) <= 0 ||
      !Number.isSafeInteger(matchingOffer.pack_cost_minor) ||
      Number(matchingOffer.pack_cost_minor) <= 0 ||
      matchingOffer.currency_code !== 'CHF'
    ) {
      throw new Error(
        `Supplier Demo ${supplierId}/${ingredient.id} has invalid pack terms.`
      )
    }
  }

  const itemIds = new Set(scenario.items.map((item) => item.id))
  const catalogueItemIds: string[] = []
  for (const catalogue of scenario.catalogues) {
    for (const section of catalogue.sections) {
      for (const catalogueItem of section.items) {
        if (!itemIds.has(catalogueItem.supplier_item_id)) {
          throw new Error(
            `Supplier Demo catalogue ${catalogue.id} references a missing SupplierItem.`
          )
        }
        catalogueItemIds.push(catalogueItem.supplier_item_id)
      }
    }
  }

  if (
    scenario.supplier.catalogue.mode === 'integrated' &&
    !sameStringSet([...itemIds], catalogueItemIds)
  ) {
    throw new Error(
      `Supplier Demo ${supplierId} catalogue must contain every SupplierItem exactly once.`
    )
  }
}
