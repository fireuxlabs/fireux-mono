// Concurrent edit — 2026-07-20 22:24 CEST — Both-Entity Authority — Supplier: keep canonical root identity and ownership separate from App access.
import { defineFireuxEntity } from 'fireux-core/runtime/models/core/entity.model'
import type {
  FireuxAppOverlay,
  FireuxStamped,
} from 'fireux-core/runtime/models/core/meta.model'
import {
  FireuxAppOverlayModel,
  FireuxAppScope,
} from 'fireux-core/runtime/models/core/meta.model'
import type { FirebaseTimestamp } from 'fireux-core/types/firebase'

export type SupplierState = 'official' | 'public'
export type SupplierCatalogueState = 'integrated' | 'public_only'

type WidenLiteral<T> =
  T extends string ? string
  : T extends number ? number
  : T extends boolean ? boolean
  : T extends readonly (infer U)[] ? WidenLiteral<U>[]
  : T extends Record<string, unknown> ? { -readonly [K in keyof T]: WidenLiteral<T[K]> }
  : T

/**
 * Runtime models canon: packages/core/fireux-docs/src/runtime/models/README.md
 *
 * Family: Domain
 * Storage: root canonical record plus app-scoped record
 * Root storage path: /suppliers/<supplierId>
 * Public route: /suppliers/<slug>
 * App path: /apps/<appId>/suppliers/<supplierId>
 * Child scope: /apps/<appId>/suppliers/<supplierId>/<childCollection>/<childId>
 *
 * Decision note:
 * - Supplier is a domain entity with one canonical root and an app-hosted
 *   access-support record, not a user profile. Public reads are a separate contract.
 * - The path should read as supplier identity rather than user identity.
 * - Public facade depth can vary by family; Supplier may expose only the fields that make sense for its marketplace/public role.
 * - Any future supplier operator profile should remain a prerequisite or presentation layer, not a second ownership model.
 * - Supplier console governance belongs to the app-hosted supplier record.
 * - Supplier-owned ingredient coverage lives beneath the root supplier record and links to Ingredient.
 * - Supplier-owned item offers live beneath the root supplier record and link to Product.
 * - Supplier catalogue records, when introduced, should present/group supplier item offers rather than replace them.
 * - Supplier v1 stays intentionally small: company link, organization name, headline, summary, bio, image, categories, delivery areas, state, catalogue state, and linked ingredients.
 * - If that changes later, update the models README first, then this file.
 */
export const SupplierStorage = {
  shape: 'both',
  root: 'suppliers/{supplierId}',
  overlay: 'apps/{appId}/suppliers/{supplierId}',
  rootCollection: 'suppliers',
  overlayCollection: 'suppliers',
  idParam: 'supplierId',
  children: {
    catalogues: 'suppliers/{supplierId}/catalogues/{catalogueId}',
    ingredients: 'suppliers/{supplierId}/ingredients/{ingredientId}',
    items: 'suppliers/{supplierId}/items/{supplierItemId}',
  },
} as const

export const SupplierEntity = defineFireuxEntity({
  kind: 'entity',
  name: 'Supplier',
  family: ['supplier', 'console-entity'],
  storage: 'both',
  status: 'confirmed',
  console: true,
  root: SupplierStorage.root,
  scoped: SupplierStorage.overlay,
})

export const AppSupplierStorage = {
  shape: 'scoped',
  path: 'apps/{appId}/suppliers/{supplierId}',
  collection: 'suppliers',
  parent: 'app',
  idParam: 'supplierId',
} as const

export const SupplierModel = {
  id: '',
  ...FireuxAppScope,
  company_id: '',
  slug: '',

  // Public-facing supplier identity
  supplier_organization_name: '',
  tagline: '',
  supplier_headline: '',
  summary: '',
  supplier_bio: '',
  supplier_image: '',
  supplier_item_categories: [] as string[],
  supplier_delivery_areas: [] as string[],
  state: 'public' as SupplierState,
  catalogue_state: 'public_only' as SupplierCatalogueState,
  linked_ingredient_ids: [] as string[],
  hello: '',

  created: {
    at: {} as FirebaseTimestamp,
    by: undefined as FireuxStamped['created']['by'],
    app_id: undefined as FireuxStamped['created']['app_id'],
  },
  updated: {
    at: {} as FirebaseTimestamp,
    by: undefined as FireuxStamped['updated']['by'],
  },
} as const

export type Supplier = WidenLiteral<typeof SupplierModel>

export const AppSupplierModel = {
  ...FireuxAppOverlayModel,
} as const

export type AppSupplier = FireuxAppOverlay

export type SupplierCreateInput = Omit<
  Supplier,
  | 'id'
  | 'created'
  | 'updated'
  | 'app_scope_state'
  | 'app_scope_app_id'
  | 'tagline'
  | 'slug'
> &
  Partial<
    Pick<
      Supplier,
      'tagline' | 'slug'
    >
  >

export type SupplierUpdateInput = Partial<
  Omit<
    Supplier,
    | 'id'
    | 'created'
    | 'updated'
    | 'app_scope_state'
    | 'app_scope_app_id'
  >
>
export type AppSupplierUpdateInput = Partial<
  Omit<AppSupplier, 'id' | 'created' | 'updated'>
>

export type SupplierIngredientState =
  | 'available'
  | 'limited'
  | 'unavailable'
  | string

/**
 * Family: Supplier-scoped
 * Storage: supplier-owned coverage wrapper over canonical Ingredient
 * Path: /suppliers/<supplierId>/ingredients/<ingredientId>
 *
 * Decision note:
 * - SupplierIngredient means "this supplier supplies this global ingredient."
 * - It is not a replacement for Ingredient.
 * - Supplier items remain the concrete purchasable lines, packs, SKUs, and pricing.
 */
export const SupplierIngredientStorage = {
  shape: 'scoped',
  path: 'suppliers/{supplierId}/ingredients/{ingredientId}',
  collection: 'ingredients',
  parent: 'supplier',
  idParam: 'ingredientId',
} as const

export const SupplierIngredientModel = {
  id: '',
  supplier_id: '',
  ingredient_id: '',

  status: 'available' as SupplierIngredientState,
  preferred_product_id: '',
  notes: '',
  active: true as boolean,

  created: {
    at: {} as FirebaseTimestamp,
    by: undefined as FireuxStamped['created']['by'],
    app_id: undefined as FireuxStamped['created']['app_id'],
  },
  updated: {
    at: {} as FirebaseTimestamp,
    by: undefined as FireuxStamped['updated']['by'],
  },
} as const

export type SupplierIngredient = WidenLiteral<typeof SupplierIngredientModel>

export type SupplierIngredientCreateInput = Omit<
  SupplierIngredient,
  'id' | 'created' | 'updated'
>

export type SupplierIngredientUpdateInput = Partial<
  Omit<SupplierIngredient, 'id' | 'supplier_id' | 'ingredient_id' | 'created' | 'updated'>
>

export type SupplierItemAvailabilityState =
  | 'available'
  | 'limited'
  | 'unavailable'
  | string

/**
 * Family: Supplier-scoped
 * Storage: supplier-owned sale/procurement wrapper over canonical Product
 * Path: /suppliers/<supplierId>/items/<supplierItemId>
 *
 * Decision note:
 * - SupplierItem is not a replacement for Product.
 * - Keep `product_id` as the required link to commercial identity.
 * - Keep `ingredient_id` optional because only some supplier items map to kitchen stock/use items.
 * - Supplier-specific packaging, SKU, availability, and procurement cost live here.
 */
export const SupplierItemStorage = {
  shape: 'scoped',
  path: 'suppliers/{supplierId}/items/{supplierItemId}',
  collection: 'items',
  parent: 'supplier',
  idParam: 'supplierItemId',
} as const

export const SupplierItemModel = {
  id: '',
  supplier_id: '',
  product_id: '',
  ingredient_id: '',

  name_override: '',
  description_override: '',
  image_override: '',

  pack_size_label: '',
  supplier_sku: '',
  unit: '',
  quantity_per_pack: null as number | null,
  order_unit: '',
  pack_cost_minor: null as number | null,
  currency_code: '',
  availability_state: 'available' as SupplierItemAvailabilityState,
  lead_time_days: null as number | null,
  min_order_quantity: null as number | null,
  active: true as boolean,
  metadata: {} as Record<string, any>,

  created: {
    at: {} as FirebaseTimestamp,
    by: undefined as FireuxStamped['created']['by'],
    app_id: undefined as FireuxStamped['created']['app_id'],
  },
  updated: {
    at: {} as FirebaseTimestamp,
    by: undefined as FireuxStamped['updated']['by'],
  },
} as const

type SupplierItemModelShape = WidenLiteral<typeof SupplierItemModel>

export type SupplierItem = Omit<SupplierItemModelShape, 'ingredient_id'> & {
  ingredient_id?: string
}

export type SupplierItemCreateInput = Omit<
  SupplierItem,
  'id' | 'created' | 'updated'
>

export type SupplierItemUpdateInput = Partial<
  Omit<SupplierItem, 'id' | 'supplier_id' | 'product_id' | 'created' | 'updated'>
>

export type SupplierCatalogueItem = {
  id: string
  supplier_item_id: string
  product_id: string
  label: string
  active: boolean
  sort_order: number
}

export type SupplierCatalogueSection = {
  id: string
  label: string
  description: string
  items: SupplierCatalogueItem[]
  sort_order: number
}

/**
 * Family: Supplier-scoped
 * Storage: supplier-owned presentation/grouping surface
 * Path: /suppliers/<supplierId>/catalogues/<catalogueId>
 *
 * Decision note:
 * - SupplierCatalogue organizes SupplierItem rows for presentation.
 * - It does not own SKU, pack, price, or availability terms.
 * - Catalogue items point back to supplier items and may carry light labels/sort state.
 */
export const SupplierCatalogueStorage = {
  shape: 'scoped',
  path: 'suppliers/{supplierId}/catalogues/{catalogueId}',
  collection: 'catalogues',
  parent: 'supplier',
  idParam: 'catalogueId',
} as const

export const SupplierCatalogueModel = {
  id: '',
  supplier_id: '',
  name: '',
  description: '',
  active: true as boolean,
  sections: [] as SupplierCatalogueSection[],
  sort_order: 0,

  created: {
    at: {} as FirebaseTimestamp,
    by: undefined as FireuxStamped['created']['by'],
    app_id: undefined as FireuxStamped['created']['app_id'],
  },
  updated: {
    at: {} as FirebaseTimestamp,
    by: undefined as FireuxStamped['updated']['by'],
  },
} as const

export type SupplierCatalogue = WidenLiteral<typeof SupplierCatalogueModel>

export type SupplierCatalogueCreateInput = Omit<
  SupplierCatalogue,
  'id' | 'created' | 'updated'
>

export type SupplierCatalogueUpdateInput = Partial<
  Omit<SupplierCatalogue, 'id' | 'supplier_id' | 'created' | 'updated'>
>
