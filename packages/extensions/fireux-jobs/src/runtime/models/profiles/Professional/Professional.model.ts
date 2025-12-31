import type { Profile } from 'fireux-core/runtime/models/core/profile.model'
import {
  professionalConfig,
  type OtherExperienceItem,
  type RelevantExperienceItem,
} from './supporting'

/**
 * Firestore shapes only. No UI. No composable wiring. No generics.
 *
 * Core doc:  professionals/{uid}
 * App doc:   apps/{appId}/professionals/{uid}
 */
export interface ProfessionalCore extends Profile {
  tagline: string
  health_certifications: string[]
  bio_short: string
  bio_long: string
  specialties: string[]
  locations: string[]
  avatar: string
  avatar_url: string
  relevant_experience: RelevantExperienceItem[]
  other_experience: OtherExperienceItem[]
}

/**
 * Tenant overlay (delta-only).
 * Keep empty until you truly need tenant-specific fields.
 */
export interface ProfessionalApp extends Profile {}

export { professionalConfig }
