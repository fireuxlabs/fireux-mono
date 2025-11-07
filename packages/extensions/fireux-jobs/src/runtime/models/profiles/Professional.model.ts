import type {
  Profile,
  ProfileConfig,
} from 'fireux-core/runtime/models/core/profile.model.ts'
import type { Pill as PillModel } from 'fireux-core/runtime/types/pill.model.ts'

/** Minimal shared structure for any experience entry */
export interface ExperienceBase {
  role?: string
  from_month?: string
  from_year?: string
  to_month?: string | null
  to_year?: string | null
  ongoing?: boolean
  responsibilities?: string
}

/** Experience tied to a canonical Place document in Firestore */
export interface RelevantExperienceItem extends ExperienceBase {
  /** Canonical ID for join (places/{place_id}) */
  place_id: string
}

/** Experience referencing an external place snapshot (prefer Firestore data when available, but stay self-contained) */
export interface OtherExperienceItem extends ExperienceBase {
  /** Optional non-authoritative place reference for future backfill */
  place_id?: string
  /** Snapshot data captured at creation time */
  name: string
  formatted_address?: string
  short_address?: string
  image_url?: string | null
}

/** Unified Professional experience item */
export type ExperienceItem = RelevantExperienceItem | OtherExperienceItem

/**
 * Domain profile used by Jobs UIs.
 * Extends the minimal core `Profile` shape with domain fields.
 * - `title | subtitle | badges` live on the base Profile for pill compatibility.
 */
export interface ProfessionalProfile extends Profile {
  display_name?: string
  avatar?: string | null
  avatar_url?: string | null
  title?: string | null
  subtitle?: string | null
  badges?: string[]
  health_certifications?: string[]
  bio_short?: string | null
  bio_long?: string | null
  specialties?: string[]
  relevant_experience?: RelevantExperienceItem[]
  other_experience?: OtherExperienceItem[]
}

/**
 * Legacy aliases retained while downstream modules migrate.
 * - Core/App profiles previously used separate interfaces; now they share the domain shape.
 */
export type ProfessionalCoreProfile = ProfessionalProfile
export type ProfessionalAppProfile = ProfessionalProfile

/** Cards */
export namespace ProfessionalCard {
  export interface Pill extends PillModel.Props {}

  export interface Cell extends Pill {
    id: string
    to?: string
    bio_short?: string | null
    specialties?: string[]
  }

  export interface Profile extends Cell {
    bio_long?: string | null
  }
}

// Bios use snake_case (bio_short, bio_long) across the domain profile and cards.

/** Config */
export const professionalConfig: ProfileConfig = {
  id: 'professional',
  collectionName: 'professionals',
  profileType: 'Professional',
  cta: 'Create your Professional profile to appear in listings.',
} as const
