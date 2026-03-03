// FILE: packages/extensions/fireux-drop/src/runtime/models/profiles/Supplier/Supplier.model.ts

import type { FireuxStamped } from 'fireux-core/runtime/models/core/meta.model'
import type { FirebaseTimestamp } from 'fireux-core/types/firebase'
/**
 * FireUX Canon (Consoleable, 2-layer)
 *
 * Core (root scope)
 * - Path: /suppliers/<supplierId>
 * - Purpose: identity + supplier profile content (can be private by rules; root != public)
 *
 * App (tenancy scope / private overlay)
 * - Path: /apps/<appId>/suppliers/<supplierId>
 * - Purpose: governance + console/private switches + app-only controls
 *
 * NOTE:
 * Supplier is placeholder right now — keep it simple + canon-shaped.
 */

export const SupplierCore = {
  id: '' as string,

  // Display/content (minimal placeholder)
  supplier_headline: '' as string,
  supplier_bio: '' as string,
  supplier_image: '' as string,

  supplier_product_categories: [] as string[],
  supplier_delivery_areas: [] as string[],

  supplier_organization_name: '' as string,

  // Stamps
  created: {
    at: {} as FirebaseTimestamp,
    by: undefined as FireuxStamped['created']['by'],
  },
  updated: {
    at: {} as FirebaseTimestamp,
    by: undefined as FireuxStamped['updated']['by'],
  },
} as const

export type SupplierCore = {
  [K in keyof typeof SupplierCore]: (typeof SupplierCore)[K]
}

export const SupplierApp = {
  id: '' as string,

  // Governance (private)
  admin_ids: [] as string[],
  join_requests: [] as string[],

  // Console / ops (private)
  console_enabled: true as boolean,

  // Stamps
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

export type SupplierApp = {
  [K in keyof typeof SupplierApp]: (typeof SupplierApp)[K]
}
