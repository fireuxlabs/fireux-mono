// @ts-nocheck
// Snapshot of packages/extensions/fireux-jobs/src/runtime/models/profiles/Professional.model.ts taken on 2025-11-03
// Local minimal copies of core types to avoid restricted subpath imports
// Keep in sync with fireux-core runtime models if fields evolve
export interface ProfileBase {
  id: string
  display_name: string
  avatar: string
  created_at: any
  updated_at?: any
}

export interface ProfileConfig {
  id: string
  collectionName: string
  profileType: string
  cta?: string
}

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

/** Unified Professional */
export interface Professional {
  id: string
  display_name?: string
  avatar?: string
  core: ProfessionalCoreProfile | null
  app?: ProfessionalAppProfile | null
}

/** Global: professionals/{uid} */
export interface ProfessionalCoreProfile extends ProfileBase {
  title?: string | null
  bio_short?: string | null
  bio_long?: string | null
  specialties?: string[]
  /** neutralized experience fields */
  relevant_experience?: RelevantExperienceItem[]
  other_experience?: OtherExperienceItem[]
}

/** App overlay: apps/{appId}/professionals/{uid} */
export interface ProfessionalAppProfile extends ProfileBase {
  title?: string | null
  bio_short?: string | null
  specialties?: string[]
  /** allow app-level overlays too */
  relevant_experience?: RelevantExperienceItem[]
  other_experience?: OtherExperienceItem[]
}

/** Cards */
export namespace ProfessionalCard {
  export interface Pill {
    id: string
    display_name: string
    avatar?: string
    title?: string | null
  }
  export interface Cell extends Pill {
    bio_short?: string | null
    specialties?: string[]
  }
  export interface Profile extends Cell {
    bio_long?: string | null
  }
}

// Bios use snake_case (bio_short, bio_long) across core/app/card.

/** Config */
export const professionalConfig: ProfileConfig = {
  id: 'professional',
  collectionName: 'professionals',
  profileType: 'Professional',
  cta: 'Create your Professional profile to appear in listings.',
} as const
