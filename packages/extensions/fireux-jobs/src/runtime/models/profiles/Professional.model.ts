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

/** Neutral, platform-agnostic experience item */
export type ExperienceItem = {
  name?: string
  role?: string
  from_month?: string
  from_year?: string
  to_month?: string | null
  to_year?: string | null
  ongoing?: boolean
  responsibilities?: string
  /** Link to canonical place */
  place_id?: string
}

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
  relevant_experience?: ExperienceItem[]
  other_experience?: ExperienceItem[]
}

/** App overlay: apps/{appId}/professionals/{uid} */
export interface ProfessionalAppProfile extends ProfileBase {
  title?: string | null
  bio_short?: string | null
  specialties?: string[]
  /** allow app-level overlays too */
  relevant_experience?: ExperienceItem[]
  other_experience?: ExperienceItem[]
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
