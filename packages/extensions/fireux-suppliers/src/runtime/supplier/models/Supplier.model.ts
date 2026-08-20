// Concurrent edit — 2026-07-20 22:24 CEST — Both-Entity Authority — Supplier: keep canonical root identity and ownership separate from App access.
// Concurrent edit — 2026-07-20 22:37 CEST — Supplier/Portfolio Authority Hardening: remove the generic App access mutation input.
// Concurrent edit — 2026-07-20 23:30 CEST — Entity Vocabulary + Matrix Pass: classify Supplier root identity and access-only App support.
// Concurrent edit — 2026-07-20 23:46 CEST — App Support Vocabulary Pass: name Supplier access support directly.
import { defineFireuxEntity } from 'fireux-core/runtime/models/utils/entity.model'
import type { FireuxAppAccessRecord } from 'fireux-core/runtime/models/utils/workspace-entity.model'
import type { FireuxStamped } from 'fireux-core/runtime/models/utils/stamps.model'
import { FireuxAppAccessRecordModel } from 'fireux-core/runtime/models/utils/workspace-entity.model'
import { FireuxEntityManagementDefaults } from 'fireux-core/runtime/models/utils/scope.model'
import type { FireuxEntityManagement } from 'fireux-core/runtime/models/utils/scope.model'
import type { FirebaseTimestamp } from 'fireux-core/types/firebase'

export type SupplierState = 'official' | 'public'
export type SupplierCatalogueState = 'integrated' | 'public_only'

export {
  SupplierItemDefaults,
  SupplierItemRecord,
  SupplierItemStorage,
  type SupplierItem,
  type SupplierItemAvailabilityState,
  type SupplierItemCreateInput,
  type SupplierItemUpdateInput,
} from './supplier-item.model.ts'

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
 * Detail route: /suppliers/<slug>
 * App path: /apps/<appId>/suppliers/<supplierId>
 * Child scope: /apps/<appId>/suppliers/<supplierId>/<childCollection>/<childId>
 *
 * Decision note:
 * - Supplier is a domain entity with one canonical readable root and an
 *   app-hosted access-support record, not a user profile.
 * - The path should read as supplier identity rather than user identity.
 * - Any future supplier operator profile should remain a prerequisite or presentation layer, not a second ownership model.
 * - Supplier workspace governance belongs to the app-hosted supplier record.
 * - Supplier-owned ingredient coverage lives beneath the root supplier record and links to Ingredient.
 * - Supplier-owned item offers live beneath the root supplier record and link to Product.
 * - Supplier catalogue records, when introduced, should present/group supplier item offers rather than replace them.
 * - Supplier v1 stays intentionally small: company link, organization name, headline, summary, bio, image, categories, delivery areas, state, catalogue state, and linked ingredients.
 * - If that changes later, update the models README first, then this file.
 */
export const SupplierStorage = {
  shape: 'root',
  path: 'suppliers/{supplierId}',
  collection: 'suppliers',
  idParam: 'supplierId',
} as const

export const AppSupplierStorage = {
  shape: 'scoped',
  path: 'apps/{appId}/suppliers/{supplierId}',
  collection: 'suppliers',
  parent: 'app',
  idParam: 'supplierId',
} as const

export const SupplierEntity = defineFireuxEntity({
  kind: 'entity',
  name: 'Supplier',
  family: ['supplier', 'workspace-entity'],
  identity: 'root',
  authority: 'owning-app-database',
  appSupport: 'access-record',
  workspace: true,
  root: SupplierStorage.path,
  appSupportPath: AppSupplierStorage.path,
})

export const SupplierDefaults = {
  id: '',
  management: FireuxEntityManagementDefaults,
  company_id: '',
  slug: '',

  // Supplier identity
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

export type Supplier = Omit<
  WidenLiteral<typeof SupplierDefaults>,
  'management'
> & { management: FireuxEntityManagement }

export const AppSupplierDefaults = {
  ...FireuxAppAccessRecordModel,
} as const

export type AppSupplier = FireuxAppAccessRecord

export type SupplierCreateInput = Omit<
  Supplier,
  | 'id'
  | 'created'
  | 'updated'
  | 'management'
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
    | 'management'
  >
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

export const SupplierIngredientDefaults = {
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

export type SupplierIngredient = WidenLiteral<typeof SupplierIngredientDefaults>

export type SupplierIngredientCreateInput = Omit<
  SupplierIngredient,
  'id' | 'created' | 'updated'
>

export type SupplierIngredientUpdateInput = Partial<
  Omit<SupplierIngredient, 'id' | 'supplier_id' | 'ingredient_id' | 'created' | 'updated'>
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

export const SupplierCatalogueDefaults = {
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

export type SupplierCatalogue = WidenLiteral<typeof SupplierCatalogueDefaults>

export type SupplierCatalogueCreateInput = Omit<
  SupplierCatalogue,
  'id' | 'created' | 'updated'
>

export type SupplierCatalogueUpdateInput = Partial<
  Omit<SupplierCatalogue, 'id' | 'supplier_id' | 'created' | 'updated'>
>
