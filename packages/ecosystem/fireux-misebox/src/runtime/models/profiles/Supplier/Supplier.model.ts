import type { Profile } from 'fireux-core/runtime/models/core/profile.model'
import type { DomainProfile } from 'fireux-core/runtime/models/core/profile.model'
import { supplierConfig } from '../Supplier/supporting'

/**
 * Hydrated Supplier shape used by composables.
 * - `user` is the canonical user surface (avatar / display_name).
 * - `core` is the global Supplier profile document.
 * - `app` is the optional tenant overlay document.
 */
export type Supplier = DomainProfile<SupplierProfile, SupplierAppProfile> &
  SupplierProfile & {
    id: string
  }

/**
 * Supplier domain shapes
 * Shape-only, no UI concerns.
 */
export namespace Supplier {
  /**
   * Core Supplier profile (global truth)
   * Firestore: suppliers/{uid}
   */
  export interface ProfileCore extends Profile {
    tagline?: string | null
    bio_short?: string | null
    bio_long?: string | null
    specialties?: string[]
    categories?: string[]
    avatar?: string | null
    avatar_url?: string | null
    organization_name?: string | null

    business_type?: string | null
    locations?: Array<{ city?: string | null; country?: string | null }>
    years_in_business?: number | null
    products_offered?: string[]
    employee_count?: number | null
    certifications?: string[]
    delivery_range?: number | null
  }

  /**
   * Tenant Supplier overlay (delta-only)
   * Firestore: apps/{appId}/suppliers/{uid}
   *
   * Intentionally empty for now.
   * Add fields only when a true tenant-specific delta is required.
   */
  export interface ProfileApp extends Profile {}
}

/**
 * Firestore-facing aliases
 */
export type SupplierProfile = Supplier.ProfileCore
export type SupplierCoreProfile = Supplier.ProfileCore
export type SupplierAppProfile = Supplier.ProfileApp

export { supplierConfig }
