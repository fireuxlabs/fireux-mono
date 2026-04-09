import type { FireuxStamped } from 'fireux-core/runtime/models/core/meta.model'
import type { FirebaseTimestamp } from 'fireux-core/types/firebase'

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
 * - Supplier v1 stays intentionally small: organization name, headline, summary, bio, image, categories, and delivery areas.
 * - If that changes later, update the models README first, then this file.
 */

export const SupplierModel = {
  id: '',

  // Public-facing supplier identity
  supplier_organization_name: '',
  supplier_headline: '',
  summary: '',
  supplier_bio: '',
  supplier_image: '',
  supplier_product_categories: [] as string[],
  supplier_delivery_areas: [] as string[],

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

export type Supplier = {
  [K in keyof typeof SupplierModel]: (typeof SupplierModel)[K]
}

export const AppSupplierModel = {
  id: '',
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

export type AppSupplier = {
  [K in keyof typeof AppSupplierModel]: (typeof AppSupplierModel)[K]
}

export type SupplierCreateInput = Omit<Supplier, 'id' | 'created' | 'updated'>

export type SupplierUpdateInput = Partial<Omit<Supplier, 'id' | 'created' | 'updated'>>
