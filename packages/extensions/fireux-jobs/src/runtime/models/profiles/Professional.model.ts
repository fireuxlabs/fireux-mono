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

/** Domain-level Professional profile (Firestore document shape) */
export interface ProfessionalProfile extends Profile {
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

/** Global: professionals/{uid} */
export type ProfessionalCoreProfile = ProfessionalProfile

/** App overlay: apps/{appId}/professionals/{uid} */
export type ProfessionalAppProfile = ProfessionalProfile

/** Professional card shapes consumed by the UI */
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
    subtitle?: string | null
    badges?: string[]
    health_certifications?: string[]
    bio_long?: string | null
    relevant_experience?: RelevantExperienceItem[]
    other_experience?: OtherExperienceItem[]
  }

  /** Tenant APP overlay (delta space) */
  export interface ProfileApp extends Cell {
    bio_short?: string | null
    specialties?: string[]
  }
}

// Re-export runtime config for convenience
export { professionalConfig }
