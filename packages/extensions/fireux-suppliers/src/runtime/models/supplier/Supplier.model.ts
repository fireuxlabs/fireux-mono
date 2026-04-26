import type {
  FireuxAppOverlay,
  FireuxStamped,
} from 'fireux-core/runtime/models/core/meta.model'
import { FireuxAppOverlayModel } from 'fireux-core/runtime/models/core/meta.model'
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
 * Root path: /suppliers/<supplierId>
 * App path: /apps/<appId>/suppliers/<supplierId>
 * Child scope: /apps/<appId>/suppliers/<supplierId>/<childCollection>/<childId>
 *
 * Decision note:
 * - Supplier is treated as a domain entity with a root public entity and an app-hosted supplier record, not as a user profile.
 * - The path should read as supplier identity rather than user identity.
 * - Public facade depth can vary by family; Supplier may expose only the fields that make sense for its marketplace/public role.
 * - Any future supplier operator profile should remain a prerequisite or presentation layer, not a second ownership model.
 * - Supplier operational state belongs to the app-hosted supplier record.
 * - Supplier-owned child records, if they become real, should live beneath that record.
 * - Supplier v1 stays intentionally small: company link, organization name, headline, summary, bio, image, categories, delivery areas, state, catalogue state, and linked ingredients.
 * - If that changes later, update the models README first, then this file.
 */

export const SupplierModel = {
  id: '',
  company_id: '',

  // Public-facing supplier identity
  supplier_organization_name: '',
  supplier_headline: '',
  summary: '',
  supplier_bio: '',
  supplier_image: '',
  supplier_product_categories: [] as string[],
  supplier_delivery_areas: [] as string[],
  state: 'public' as SupplierState,
  catalogue_state: 'public_only' as SupplierCatalogueState,
  linked_ingredient_ids: [] as string[],

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

export type SupplierCreateInput = Omit<Supplier, 'id' | 'created' | 'updated'>

export type SupplierUpdateInput = Partial<Omit<Supplier, 'id' | 'created' | 'updated'>>
