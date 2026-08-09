import type { FirebaseTimestamp } from 'fireux-core/types/firebase'
import {
  AppSupplierDefaults,
  SupplierCatalogueDefaults,
  SupplierIngredientDefaults,
  SupplierItemDefaults,
  SupplierDefaults,
  type AppSupplier,
  type Supplier,
  type SupplierCatalogue,
  type SupplierIngredient,
  type SupplierItem,
} from '../../models/supplier/Supplier.model'
import type {
  SupplierDemoOfferSeed,
  SupplierDemoScenarioSeed,
} from './scenario-types'

export const createdTimestamp: FirebaseTimestamp = {
  seconds: 1_784_620_800,
  nanoseconds: 0,
}

export const updatedTimestamp: FirebaseTimestamp = {
  seconds: 1_784_966_400,
  nanoseconds: 0,
}

export const created = {
  at: createdTimestamp,
  by: 'demo',
  app_id: 'misebox-app',
}

export const updated = {
  at: updatedTimestamp,
  by: 'demo',
}

export const supplierItem = (
  supplierId: string,
  input: SupplierDemoOfferSeed
): SupplierItem => ({
  ...SupplierItemDefaults,
  id: input.itemId || `${supplierId}-${input.ingredientId}`,
  supplier_id: supplierId,
  product_id: input.productId || `${input.ingredientId}-foodservice`,
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
  active: true,
  created,
  updated,
})

export const supplierIngredient = (
  supplierId: string,
  supplierOffer: SupplierItem
): SupplierIngredient => ({
  ...SupplierIngredientDefaults,
  id: String(supplierOffer.ingredient_id || '').trim(),
  supplier_id: supplierId,
  ingredient_id: String(supplierOffer.ingredient_id || '').trim(),
  status: 'available',
  preferred_product_id: supplierOffer.product_id,
  active: true,
  created,
  updated,
})

export const supplierRoot = (
  input: SupplierDemoScenarioSeed,
  ingredients: SupplierIngredient[],
  appId: string
): Supplier => ({
  ...SupplierDefaults,
  id: input.id,
  app_scope_state: 'parent_app',
  app_scope_app_id: appId,
  company_id: input.companyId,
  slug: input.id,
  supplier_organization_name: input.name,
  tagline: input.headline,
  supplier_headline: input.headline,
  supplier_image: input.logoImageUrl,
  summary: `${input.name} is a deterministic read-only Supplier Console example.`,
  supplier_bio: `${input.name} supplies connected Demo Kitchens through one shared read-only Misebox world.`,
  supplier_item_categories: [...input.categories],
  supplier_delivery_areas: ['Switzerland'],
  state: input.state,
  catalogue_state: input.catalogueState,
  linked_ingredient_ids: ingredients.map(
    (ingredient) => ingredient.ingredient_id
  ),
  hello: `Welcome to ${input.name}.`,
  created,
  updated,
})

export const supplierAppSupport = (
  supplierId: string,
  appId: string
): AppSupplier => ({
  ...AppSupplierDefaults,
  id: supplierId,
  operator_ids: [],
  team_ids: [],
  join_requests: [],
  created: {
    ...created,
    app_id: appId,
  },
  updated,
})

export const supplierCatalogue = (
  supplierId: string,
  input: NonNullable<SupplierDemoScenarioSeed['catalogue']>,
  offers: SupplierDemoOfferSeed[],
  items: SupplierItem[]
): SupplierCatalogue => ({
  ...SupplierCatalogueDefaults,
  id: input.id,
  supplier_id: supplierId,
  name: input.name,
  description: input.description,
  sections: input.sections.map((section, sectionIndex) => ({
    id: section.id,
    label: section.label,
    description: section.description,
    items: offers
      .filter((offer) => offer.sectionId === section.id)
      .map((offer, itemIndex) => {
        const item = items.find(
          (candidate) => candidate.ingredient_id === offer.ingredientId
        )
        if (!item) {
          throw new Error(
            `Supplier Demo catalogue ${input.id} is missing ${offer.ingredientId}.`
          )
        }

        return {
          id: `${supplierId}-catalogue-${item.id}`,
          supplier_item_id: item.id,
          product_id: item.product_id,
          label: item.name_override,
          active: true,
          sort_order: itemIndex + 1,
        }
      }),
    sort_order: sectionIndex + 1,
  })),
  sort_order: 1,
  created,
  updated,
})
