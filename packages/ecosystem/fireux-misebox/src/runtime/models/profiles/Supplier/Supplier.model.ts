// FILE: packages/ecosystem/fireux-misebox/src/runtime/models/profiles/Supplier/Supplier.model.ts

import type { FireuxStamped } from 'fireux-core/runtime/models/core/meta.model';
import type { FirebaseTimestamp } from 'fireux-core/types/firebase';
import { supplierConfig } from './supporting';

/**
 * Runtime canonical shapes (core + app overlay)
 * Core doc:  suppliers/{uid}
 * App doc:   apps/{appId}/suppliers/{uid}
 */

export const SupplierCore = {
  id: '',
  title: '',
  subtitle: '',
  tagline: '',
  tags: [] as string[],

  bio_short: '',
  bio_long: '',
  specialties: [] as string[],
  categories: [] as string[],
  organization_name: '',

  business_type: '',
  locations: [] as Array<{ city: string; country: string }>,
  years_in_business: 0,
  products_offered: [] as string[],
  employee_count: 0,
  certifications: [] as string[],
  delivery_range: 0,

  // Stamps
  creator_id: undefined as FireuxStamped['creator_id'],
  created_at: {} as FirebaseTimestamp,
  updated_at: {} as FirebaseTimestamp,
} as const

export type SupplierCore = {
  [K in keyof typeof SupplierCore]: (typeof SupplierCore)[K]
}

export const SupplierApp = {
  id: '',

  // Stamps
  creator_id: undefined as FireuxStamped['creator_id'],
  created_at: {} as FirebaseTimestamp,
  updated_at: {} as FirebaseTimestamp,
} as const

export type SupplierApp = {
  [K in keyof typeof SupplierApp]: (typeof SupplierApp)[K]
}

export { supplierConfig };

