import type { Supplier } from '../../models/supplier/Supplier.model'
import { alpineFoodservice } from './scenario-alpine-foodservice'
import { bernMarketGarden } from './scenario-bern-market-garden'
import { pantryHouse } from './scenario-pantry-house'
import type { SupplierDemoScenario } from './scenario-types'

export type { SupplierDemoScenario } from './scenario-types'

export const supplierDemoScenarios: SupplierDemoScenario[] = [
  alpineFoodservice,
  pantryHouse,
  bernMarketGarden,
]

if (
  supplierDemoScenarios.length !== 3 ||
  supplierDemoScenarios.some(
    (scenario) =>
      !scenario.ingredients.length ||
      !scenario.items.length ||
      !scenario.catalogues.length
  )
) {
  throw new Error(
    'The Misebox Demo World requires exactly three operational Suppliers.'
  )
}

const coveredIngredientIds = supplierDemoScenarios
  .flatMap((scenario) => scenario.ingredients)
  .map((ingredient) => ingredient.ingredient_id)

if (new Set(coveredIngredientIds).size !== coveredIngredientIds.length) {
  throw new Error(
    'Supplier Demo ingredients must resolve through one supplier only.'
  )
}

const companyIds = supplierDemoScenarios.map(
  (scenario) => scenario.supplier.company_id
)

if (
  companyIds.some((companyId) => !companyId) ||
  new Set(companyIds).size !== companyIds.length
) {
  throw new Error(
    'Every Supplier Demo root requires one independent Company relationship.'
  )
}

export const supplierDemoRecords: Supplier[] = supplierDemoScenarios.map(
  (scenario) => scenario.supplier
)
