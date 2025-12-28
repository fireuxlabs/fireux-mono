import type { Profile } from 'fireux-core/runtime/models/core/profile.model'
import type { DomainProfile } from 'fireux-core/runtime/models/core/profile.model'
import type {
  RelevantExperienceItem,
  OtherExperienceItem,
} from './supporting'
import { professionalConfig } from './supporting'

/**
 * Hydrated Professional shape used by composables.
 * - `user` is the canonical user surface (avatar / display_name).
 * - `core` is the global Professional profile document.
 * - `app` is the optional tenant overlay document.
 */
export interface Professional
  extends DomainProfile<ProfessionalProfile, ProfessionalAppProfile> {
  id: string
}

/**
 * Professional domain shapes
 * Shape-only, no UI concerns.
 */
export namespace Professional {
  /**
   * Core Professional profile (global truth)
   * Firestore: professionals/{uid}
   */
  export interface ProfileCore extends Profile {
    tagline?: string | null
    health_certifications?: string[]
    bio_short?: string | null
    bio_long?: string | null
    specialties?: string[]
    locations?: string[]
    avatar?: string | null
    avatar_url?: string | null
    relevant_experience?: RelevantExperienceItem[]
    other_experience?: OtherExperienceItem[]
  }

  /**
   * Tenant Professional overlay (delta-only)
   * Firestore: apps/{appId}/professionals/{uid}
   *
   * Intentionally empty for now.
   * Add fields only when a true tenant-specific delta is required.
   */
  export interface ProfileApp extends Profile {}
}

/**
 * Firestore-facing aliases
 */
export type ProfessionalProfile = Professional.ProfileCore
export type ProfessionalCoreProfile = Professional.ProfileCore
export type ProfessionalAppProfile = Professional.ProfileApp

export { professionalConfig }
export type {
  RelevantExperienceItem,
  OtherExperienceItem,
} from './supporting'
