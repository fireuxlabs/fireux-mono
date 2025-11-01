import type {
  ProfileBase,
  ProfileConfig,
} from 'fireux-core/runtime/models/core/profile.model.ts'

export interface ExperienceBase {
  role?: string
  from_month?: string
  from_year?: string
  to_month?: string | null
  to_year?: string | null
  ongoing?: boolean
  responsibilities?: string
}

export interface RelevantExperienceItem extends ExperienceBase {
  place_id: string
}

export interface OtherExperienceItem extends ExperienceBase {
  place_id?: string
  name: string
  formatted_address?: string
  short_address?: string
  image_url?: string | null
}

export type ExperienceItem = RelevantExperienceItem | OtherExperienceItem

export interface Professional {
  id: string
  display_name?: string
  avatar?: string
  core: ProfessionalCoreProfile | null
  app?: ProfessionalAppProfile | null
}

export interface ProfessionalCoreProfile extends ProfileBase {
  title?: string | null
  bio_short?: string | null
  bio_long?: string | null
  specialties?: string[]
  relevant_experience?: RelevantExperienceItem[]
  other_experience?: OtherExperienceItem[]
}

export interface ProfessionalAppProfile extends ProfileBase {
  title?: string | null
  bio_short?: string | null
  specialties?: string[]
  relevant_experience?: RelevantExperienceItem[]
  other_experience?: OtherExperienceItem[]
}

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

export const professionalConfig: ProfileConfig = {
  id: 'professional',
  collectionName: 'professionals',
  profileType: 'Professional',
  cta: 'Create your Professional profile to appear in listings.',
} as const
