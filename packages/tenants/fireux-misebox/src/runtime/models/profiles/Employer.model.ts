import type {
  ProfileBase,
  ProfileConfig,
} from 'fireux-core/runtime/models/core/profile.model.ts'

export interface Employer {
  id: string
  display_name?: string
  avatar?: string
  core: EmployerCoreProfile | null
  app?: EmployerAppProfile | null
}

export interface EmployerCoreProfile extends ProfileBase {
  title?: string | null
  bio_short?: string | null
  bio_long?: string | null
  specialties?: string[]
}

export interface EmployerAppProfile extends ProfileBase {
  title?: string | null
  bio_short?: string | null
  specialties?: string[]
}

export namespace EmployerCard {
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

export const employerConfig: ProfileConfig = {
  id: 'employer',
  collectionName: 'employers',
  profileType: 'Employer',
  cta: 'Create your Employer profile to appear in listings.',
} as const
