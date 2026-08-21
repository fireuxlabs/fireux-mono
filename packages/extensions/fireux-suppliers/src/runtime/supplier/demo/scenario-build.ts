import {
  supplierCatalogue,
  supplierIngredient,
  supplierItem,
  supplierRoot,
} from './scenario-builders'
import type {
  SupplierDemoScenario,
  SupplierDemoScenarioSeed,
} from './scenario-types'
import { validateSupplierDemoScenario } from './scenario-validation'

export const buildSupplierDemoScenario = (
  input: SupplierDemoScenarioSeed
): SupplierDemoScenario => {
  const appId = 'misebox-app'
  const items = input.offers.map((offer) => supplierItem(input.id, offer))
  const ingredients = items.map((item) => supplierIngredient(input.id, item))
  const scenario: SupplierDemoScenario = {
    appId,
    supplier: supplierRoot(input, ingredients),
    ingredients,
    items,
    catalogues: input.catalogue
      ? [supplierCatalogue(input.id, input.catalogue, input.offers, items)]
      : [],
  }

  validateSupplierDemoScenario(scenario)
  return scenario
}
