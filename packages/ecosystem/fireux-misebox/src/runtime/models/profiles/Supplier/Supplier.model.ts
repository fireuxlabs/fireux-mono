// FILE: packages/ecosystem/fireux-misebox/src/runtime/models/profiles/Supplier/Supplier.model.ts

import type { FirebaseTimestamp } from 'fireux-core/types/firebase'
import type { AppProfileBase, CoreProfileBase } from 'fireux-core/runtime/models/core/profile.model'
import { supplierConfig } from './supporting'

/**
 * Runtime canonical shapes (core + app overlay)
 * Core doc:  suppliers/{uid}
 * App doc:   apps/{appId}/suppliers/{uid}
 */

export type SupplierCoreShape = CoreProfileBase & {
  bio_short: string
  bio_long: string
  specialties: string[]
  categories: string[]
  organization_name: string

  business_type: string
  locations: Array<{ city: string; country: string }>
  years_in_business: number
  products_offered: string[]
  employee_count: number
  certifications: string[]
  delivery_range: number
}

export const SupplierCore: SupplierCoreShape = {
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

  created_at: {} as FirebaseTimestamp,
  updated_at: {} as FirebaseTimestamp,
}

export type SupplierCore = SupplierCoreShape

export type SupplierAppShape = AppProfileBase

export const SupplierApp: SupplierAppShape = {
  id: '',
  creator_id: undefined,
  created_at: {} as FirebaseTimestamp,
  updated_at: {} as FirebaseTimestamp,
}

export type SupplierApp = SupplierAppShape

export { supplierConfig }

