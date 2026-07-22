// Concurrent edit — 2026-07-22 15:10 CEST — Demo Console shape pass: model Supplier roots and child Operations as coherent per-target scenarios.
import type { FirebaseTimestamp } from 'fireux-core/types/firebase'
import {
  SupplierCatalogueModel,
  SupplierItemModel,
  SupplierModel,
  type Supplier,
  type SupplierCatalogue,
  type SupplierItem,
} from '../../models/supplier/Supplier.model'

const timestamp: FirebaseTimestamp = {
  seconds: 1_720_000_000,
  nanoseconds: 0,
}

const created = {
  at: timestamp,
  by: 'demo',
  app_id: 'misebox-app',
}

const updated = {
  at: timestamp,
  by: 'demo',
}

export type SupplierDemoScenario = {
  appId: string
  supplier: Supplier
  items: SupplierItem[]
  catalogues: SupplierCatalogue[]
}

const supplier = (input: {
  id: string
  name: string
  headline: string
  categories: string[]
  ingredientIds: string[]
  state: Supplier['state']
  catalogueState: Supplier['catalogue_state']
}): Supplier => ({
  ...SupplierModel,
  id: input.id,
  app_scope_state: 'root_only',
  app_scope_app_id: '',
  company_id: '',
  slug: input.id,
  supplier_organization_name: input.name,
  supplier_headline: input.headline,
  summary: `${input.name} is a deterministic read-only Supplier Console example.`,
  supplier_item_categories: [...input.categories],
  supplier_delivery_areas: ['Switzerland'],
  state: input.state,
  catalogue_state: input.catalogueState,
  linked_ingredient_ids: [...input.ingredientIds],
  created,
  updated,
})

const item = (input: {
  id: string
  supplierId: string
  productId: string
  ingredientId: string
  name: string
  sku: string
  pack: string
  unit: string
  quantity: number
  costMinor: number
}): SupplierItem => ({
  ...SupplierItemModel,
  id: input.id,
  supplier_id: input.supplierId,
  product_id: input.productId,
  ingredient_id: input.ingredientId,
  name_override: input.name,
  pack_size_label: input.pack,
  supplier_sku: input.sku,
  unit: input.unit,
  quantity_per_pack: input.quantity,
  order_unit: 'pack',
  pack_cost_minor: input.costMinor,
  currency_code: 'CHF',
  availability_state: 'available',
  lead_time_days: 1,
  min_order_quantity: 1,
  created,
  updated,
})

const cityButchers = supplier({
  id: 'city-butchers',
  name: 'City Butchers',
  headline: 'Whole cuts and daily meat deliveries',
  categories: ['Meat'],
  ingredientIds: ['beef-mince', 'chicken-breast'],
  state: 'official',
  catalogueState: 'integrated',
})

const cityButchersItems: SupplierItem[] = [
  item({
    id: 'city-butchers-beef-mince-5kg',
    supplierId: cityButchers.id,
    productId: 'beef-mince-80-20',
    ingredientId: 'beef-mince',
    name: 'Beef mince 80/20',
    sku: 'CB-BEEF-5',
    pack: '5 kg case',
    unit: 'kg',
    quantity: 5,
    costMinor: 8250,
  }),
  item({
    id: 'city-butchers-chicken-breast-5kg',
    supplierId: cityButchers.id,
    productId: 'chicken-breast-fresh',
    ingredientId: 'chicken-breast',
    name: 'Fresh chicken breast',
    sku: 'CB-CHICKEN-5',
    pack: '5 kg case',
    unit: 'kg',
    quantity: 5,
    costMinor: 6950,
  }),
]

const cityButchersCatalogue: SupplierCatalogue = {
  ...SupplierCatalogueModel,
  id: 'city-butchers-core-range',
  supplier_id: cityButchers.id,
  name: 'Core kitchen range',
  description: 'The everyday meat range available to connected kitchens.',
  sections: [
    {
      id: 'fresh-meat',
      label: 'Fresh meat',
      description: 'Chilled products for daily kitchen service.',
      items: cityButchersItems.map((supplierItem, index) => ({
        id: `${cityButchers.id}-catalogue-${supplierItem.id}`,
        supplier_item_id: supplierItem.id,
        product_id: supplierItem.product_id,
        label: supplierItem.name_override,
        active: true,
        sort_order: index + 1,
      })),
      sort_order: 1,
    },
  ],
  sort_order: 1,
  created,
  updated,
}

const greenLarder = supplier({
  id: 'green-larder',
  name: 'Green Larder',
  headline: 'Seasonal produce and kitchen herbs',
  categories: ['Produce', 'Herbs'],
  ingredientIds: [],
  state: 'public',
  catalogueState: 'public_only',
})

export const supplierDemoScenarios: SupplierDemoScenario[] = [
  {
    appId: 'misebox-app',
    supplier: cityButchers,
    items: cityButchersItems,
    catalogues: [cityButchersCatalogue],
  },
  {
    appId: 'misebox-app',
    supplier: greenLarder,
    items: [],
    catalogues: [],
  },
]

export const supplierDemoRecords: Supplier[] = supplierDemoScenarios.map(
  scenario => scenario.supplier
)
