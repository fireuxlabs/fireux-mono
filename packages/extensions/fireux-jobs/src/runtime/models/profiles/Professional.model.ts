// FILE: packages/extensions/fireux-jobs/src/runtime/models/profiles/Professional.model.ts

import type { Profile } from 'fireux-core/runtime/models/core/profile.model.ts'
import type { Pill as PillModel } from 'fireux-core/runtime/types/pill.model.ts'
import type {
  RelevantExperienceItem,
  OtherExperienceItem,
} from './Professional/supporting'
import { professionalConfig } from './Professional/supporting'

/** Unified Professional wrapper (core + app overlays) */
export interface Professional {
  id: string
  display_name?: string
  avatar?: string
  core: ProfessionalCoreProfile | null
  app?: ProfessionalAppProfile | null
}

/**
 * Card + domain shapes
 * - All “profile fields” live inside ProfileCore / ProfileApp
 * - Core/App are clearly separated for future delta usage
 */
export namespace ProfessionalCard {
  /** Pill model (UI header chip) */
  export interface Pill extends PillModel.Props {}

  /** Cell model (directory list item) */
  export interface Cell extends Pill {
    id: string
    bio_short?: string | null
    specialties?: string[]
  }

  /** Full CORE profile surface */
  export interface ProfileCore extends Cell {
    user?: Profile['user']
    domain?: Profile['domain']
    created_at?: Profile['created_at']
    updated_at?: Profile['updated_at']
    // Domain profile fields (previously on ProfessionalProfile)
    title?: string | null
    subtitle?: string | null
    badges?: string[]
    health_certifications?: string[]
    bio_short?: string | null
    bio_long?: string | null
    specialties?: string[]
    avatar?: string | null
    avatar_url?: string | null
    relevant_experience?: RelevantExperienceItem[]
    other_experience?: OtherExperienceItem[]
  }

  /** Tenant APP overlay (delta space) */
  export interface ProfileApp extends Cell {
    user?: Profile['user']
    domain?: Profile['domain']
    created_at?: Profile['created_at']
    updated_at?: Profile['updated_at']
    title?: string | null
    subtitle?: string | null
    bio_short?: string | null
    specialties?: string[]
  }
}

/**
 * Firestore-facing profile types
 * - For now, core profile == UI ProfileCore
 * - App profile == UI ProfileApp (delta)
 * - ProfessionalProfile used where a generic profile type is needed
 */
export type ProfessionalProfile = ProfessionalCard.ProfileCore
export type ProfessionalCoreProfile = ProfessionalCard.ProfileCore
export type ProfessionalAppProfile = ProfessionalCard.ProfileApp

// Re-export runtime config for convenience
export { professionalConfig }
export type {
  RelevantExperienceItem,
  OtherExperienceItem,
} from './Professional/supporting'
