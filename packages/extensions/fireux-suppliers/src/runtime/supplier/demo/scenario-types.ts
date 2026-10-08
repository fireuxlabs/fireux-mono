import type {
  Supplier,
  SupplierCatalogue,
  SupplierIngredient,
  SupplierItem,
} from '../models/Supplier.model.ts'

export type SupplierDemoScenario = {
  appId: string
  supplier: Supplier
  ingredients: SupplierIngredient[]
  items: SupplierItem[]
  catalogues: SupplierCatalogue[]
}

export type SupplierDemoOfferSeed = {
  ingredientId: string
  name: string
  sku: string
  pack: string
  unit: string
  quantity: number
  costMinor: number
  sectionId: string
  itemId?: string
  productId?: string
}

export type SupplierDemoCatalogueSectionSeed = {
  id: string
  label: string
  description: string
}

export type SupplierDemoScenarioSeed = {
  id: string
  companyId: string
  name: string
  status: Supplier['identity']['status']
  catalogueState: Supplier['catalogue']['mode']
  offers: SupplierDemoOfferSeed[]
  catalogue?: {
    id: string
    name: string
    description: string
    sections: SupplierDemoCatalogueSectionSeed[]
  }
}
