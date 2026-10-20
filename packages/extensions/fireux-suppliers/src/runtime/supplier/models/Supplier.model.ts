import { defineFireuxEntity } from 'fireux-core/runtime/models/utils/entity.model'
import type { FireuxStamped } from 'fireux-core/runtime/models/utils/stamps.model'
import { FireuxEntityManagementDefaults } from 'fireux-core/runtime/models/utils/scope.model'
import type { FireuxEntityManagement } from 'fireux-core/runtime/models/utils/scope.model'
import type { FirebaseTimestamp } from 'fireux-core/types/firebase'

export type SupplierStatus = 'active' | 'inactive' | 'archived'
export type SupplierCatalogueMode = 'integrated' | 'directory_only'

export {
  SupplierItemDefaults,
  SupplierItemRecord,
  SupplierItemStorage,
  type SupplierItem,
  type SupplierItemAvailabilityState,
  type SupplierItemCreateInput,
  type SupplierItemUpdateInput,
} from './supplier-item.model.ts'

type WidenLiteral<T> = T extends string
  ? string
  : T extends number
    ? number
    : T extends boolean
      ? boolean
      : T extends readonly (infer U)[]
        ? WidenLiteral<U>[]
        : T extends Record<string, unknown>
          ? { -readonly [K in keyof T]: WidenLiteral<T[K]> }
          : T

/**
 * Ownership map: docs/concepts/suppliers.md
 *
 * Family: Domain
 * Storage: root canonical record with root-owned Team and operations
 * Root storage path: /suppliers/<supplierId>
 * Detail route: /suppliers/<supplierId>
 * Child scope: /suppliers/<supplierId>/<childCollection>/<childId>
 *
 * Decision note:
 * - Supplier is a domain entity with one canonical readable root, not a User profile.
 * - The path should read as supplier identity rather than user identity.
 * - Any future supplier operator profile should remain a prerequisite or presentation layer, not a second ownership model.
 * - Supplier Workspace access belongs to Supplier access records; Team records are organisational.
 * - Supplier-owned ingredient coverage lives beneath the root supplier record and links to Ingredient.
 * - Supplier-owned item offers live beneath the root supplier record and link to Product.
 * - Supplier catalogue records, when introduced, should present/group supplier item offers rather than replace them.
 * - Supplier stays intentionally small: Company relationship, route/publication
 *   state, catalogue mode, delivery areas, management, and audit stamps.
 * - Company/Place owns public identity and media. Supplier child collections
 *   own Ingredients, Items, Catalogues, and Team; the root does not index them.
 * - Keep the owning map current when this boundary changes.
 */
export const SupplierStorage = {
  shape: 'root',
  path: 'suppliers/{supplierId}',
  collection: 'suppliers',
  idParam: 'supplierId',
} as const

export const SupplierTeamStorage = {
  shape: 'scoped',
  path: 'suppliers/{supplierId}/team/{memberId}',
  collection: 'team',
  parent: 'supplier',
  idParam: 'memberId',
} as const

export const SupplierEntity = defineFireuxEntity({
  kind: 'entity',
  name: 'Supplier',
  family: ['supplier', 'workspace-entity'],
  identity: 'root',
  authority: 'domain-database',
  appSupport: 'none',
  workspace: true,
  root: SupplierStorage.path,
})

export const SupplierDefaults = {
  id: '',
  management: FireuxEntityManagementDefaults,
  company_id: '',
  identity: {
    slug: '',
    status: 'active' as SupplierStatus,
    visibility: true,
  },
  catalogue: { mode: 'directory_only' as SupplierCatalogueMode },
  delivery: { areas: [] as string[] },

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

export type SupplierIdentity = {
  slug: string
  status: SupplierStatus
  visibility: boolean
}
export type SupplierCatalogueConfiguration = { mode: SupplierCatalogueMode }
export type SupplierDelivery = { areas: string[] }
export type Supplier = Omit<
  WidenLiteral<typeof SupplierDefaults>,
  'management' | 'identity' | 'catalogue' | 'delivery'
> & {
  context?: string
  management: FireuxEntityManagement
  identity: SupplierIdentity
  catalogue: SupplierCatalogueConfiguration
  delivery: SupplierDelivery
}

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
  Omit<
    SupplierIngredient,
    'id' | 'supplier_id' | 'ingredient_id' | 'created' | 'updated'
  >
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
