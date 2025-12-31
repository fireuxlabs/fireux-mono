import type { Profile } from 'fireux-core/runtime/models/core/profile.model'
import { supplierConfig } from './supporting'

/**
 * Firestore shapes only. No UI. No composable wiring. No generics.
 *
 * Core doc:  suppliers/{uid}
 * App doc:   apps/{appId}/suppliers/{uid}
 */

export interface SupplierCore extends Profile {
  tagline: string
  bio_short: string
  bio_long: string
  specialties: string[]
  categories: string[]
  avatar: string
  avatar_url: string
  organization_name: string

  business_type: string
  locations: Array<{ city: string; country: string }>
  years_in_business: number
  products_offered: string[]
  employee_count: number
  certifications: string[]
  delivery_range: number
}

/**
 * Tenant overlay (delta-only).
 * Keep empty until you truly need tenant-specific fields.
 */
export interface SupplierApp extends Profile {}

export { supplierConfig }
