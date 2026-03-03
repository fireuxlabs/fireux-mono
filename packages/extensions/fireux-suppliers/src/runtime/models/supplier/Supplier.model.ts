// FILE: packages/extensions/fireux-suppliers/src/runtime/models/supplier/Supplier.model.ts

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
  // Legacy fields still consumed by existing supplier surfaces.
  title: '' as string,
  subtitle: '' as string,
  tagline: '' as string,
  summary: '' as string,
  bio_long: '' as string,
  tags: [] as string[],
  specialties: [] as string[],
  categories: [] as string[],
  organization_name: '' as string,
  business_type: '' as string,
  locations: [] as Array<{ city: string; country: string }>,
  years_in_business: 0 as number,
  products_offered: [] as string[],
  employee_count: 0 as number,
  certifications: [] as string[],
  delivery_range: 0 as number,

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
