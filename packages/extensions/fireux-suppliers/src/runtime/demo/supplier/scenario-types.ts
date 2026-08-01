import type {
  AppSupplier,
  Supplier,
  SupplierCatalogue,
  SupplierIngredient,
  SupplierItem,
} from '../../models/supplier/Supplier.model'

export type SupplierDemoScenario = {
  appId: string
  supplier: Supplier
  appSupport: AppSupplier
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
  headline: string
  logoImageUrl: string
  categories: string[]
  state: Supplier['state']
  catalogueState: Supplier['catalogue_state']
  offers: SupplierDemoOfferSeed[]
  catalogue?: {
    id: string
    name: string
    description: string
    sections: SupplierDemoCatalogueSectionSeed[]
  }
}
