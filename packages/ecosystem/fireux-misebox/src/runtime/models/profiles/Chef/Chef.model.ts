import type { Profile } from 'fireux-core/runtime/models/core/profile.model'
import type { DomainProfile } from 'fireux-core/runtime/models/core/profile.model'
import { chefConfig } from './supporting'

/**
 * Hydrated Chef shape used by composables.
 * - `user` is the canonical user surface (avatar / display_name).
 * - `core` is the global Chef profile document.
 * - `app` is the optional tenant overlay document.
 */
export type Chef = DomainProfile<ChefProfile, ChefAppProfile> &
  ChefProfile & {
    id: string
  }

/**
 * Chef domain shapes
 * Shape-only, no UI concerns.
 */
export namespace Chef {
  /**
   * Core Chef profile (global truth)
   * Firestore: chefs/{uid}
   */
  export interface ProfileCore extends Profile {
    tagline?: string | null
    bio_short?: string | null
    bio_long?: string | null
    specialties?: string[]
    locations?: string[]
    avatar?: string | null
    avatar_url?: string | null
    organization_name?: string | null
  }

  /**
   * Tenant Chef overlay (delta-only)
   * Firestore: apps/{appId}/chefs/{uid}
   *
   * Intentionally empty for now.
   * Add fields only when a true tenant-specific delta is required.
   */
  export interface ProfileApp extends Profile {}
}

/**
 * Firestore-facing aliases
 */
export type ChefProfile = Chef.ProfileCore
export type ChefCoreProfile = Chef.ProfileCore
export type ChefAppProfile = Chef.ProfileApp

export { chefConfig }
