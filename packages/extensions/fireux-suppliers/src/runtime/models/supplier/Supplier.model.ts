// FILE: packages/extensions/fireux-suppliers/src/runtime/models/supplier/Supplier.model.ts

import { FireuxConsoleOverlay, type FireuxStamped } from 'fireux-core/runtime/models/core/meta.model';
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
 * - Public facade depth can vary by family; Supplier may expose only the fields that make sense for its marketplace/public role.
 * - Console authority stays user-based in the overlay; any future supplier operator profile should remain a prerequisite or presentation layer, not a second ownership model.
 * - Supplier operational state belongs to the app-hosted supplier console overlay.
 * - Supplier-owned child records, if they become real, should live beneath that overlay.
 * - Keep the current storage shape for now and simplify the profile-era field set later in a focused pass.
 * - If that changes later, update the models README first, then this file.
 */

export const SupplierModel = {
  id: '' as string,

  // Public-facing supplier identity/content
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

export type Supplier = {
  [K in keyof typeof SupplierModel]: (typeof SupplierModel)[K]
}

export const ConsoleSupplierModel = {
  ...FireuxConsoleOverlay,
} as const

export type ConsoleSupplier = {
  [K in keyof typeof ConsoleSupplierModel]: (typeof ConsoleSupplierModel)[K]
}

export type SupplierCreateInput = Omit<Supplier, 'id' | 'created' | 'updated'>

export type SupplierUpdateInput = Partial<
  Omit<Supplier, 'id' | 'created' | 'updated'>
>
