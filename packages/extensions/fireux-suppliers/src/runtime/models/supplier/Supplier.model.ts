// FILE: packages/extensions/fireux-suppliers/src/runtime/models/supplier/Supplier.model.ts

import type { FireuxStamped } from 'fireux-core/runtime/models/core/meta.model';
import type { FirebaseTimestamp } from 'fireux-core/types/firebase';

/**
 * Runtime models canon: packages/core/fireux-docs/src/runtime/models/README.md
 *
 * Family: Console
 * Storage: root canonical record plus app overlay
 * Root path: /suppliers/<supplierId>
 * Overlay path: /apps/<appId>/suppliers/<supplierId>
 * Child scope: /apps/<appId>/suppliers/<supplierId>/<childCollection>/<childId>
 *
 * Decision note:
 * - Supplier is treated as a domain entity with a root public entity and an app-hosted supplier console, not as a user profile.
 * - The path should read as supplier identity rather than user identity, even while some profile-era content fields remain during simplification.
 * - Supplier operational state belongs to the app-hosted supplier console overlay.
 * - Supplier-owned child records, if they become real, should live beneath that overlay.
 * - Keep the current storage shape for now and simplify the profile-era field set later in a focused pass.
 * - If that changes later, update the models README first, then this file.
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
  // Deprecated fields retained temporarily for migration compatibility.
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
