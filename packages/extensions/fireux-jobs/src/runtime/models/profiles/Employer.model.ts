// packages/extensions/fireux-jobs/src/runtime/models/profiles/Employer.model.ts
import type {
  Profile,
  ProfileConfig,
} from 'fireux-core/runtime/models/core/profile.model.ts'
import type { Pill as PillModel } from 'fireux-core/runtime/types/pill.model.ts'

/** Unified Employer */
export interface Employer {
  id: string
  display_name?: string
  avatar?: string
  core: EmployerCoreProfile | null
  app?: EmployerAppProfile | null
}

/** Domain profile exposed to Jobs UI (extends core Profile shape) */
export interface EmployerProfile extends Profile {
  title?: string | null
  subtitle?: string | null
  badges?: string[]
  bio_short?: string | null
  bio_long?: string | null
  specialties?: string[]
  avatar?: string | null
  avatar_url?: string | null
  organization_name?: string | null
  locations?: string[]
}

/** Global: employers/{uid} */
export type EmployerCoreProfile = EmployerProfile

/** App overlay: apps/{appId}/employers/{uid} */
export type EmployerAppProfile = EmployerProfile

/** Cards */
export namespace EmployerCard {
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

/** Config */
export const employerConfig: ProfileConfig = {
  id: 'employer',
  collectionName: 'employers',
  profileType: 'Employer',
  cta: 'Create your Employer profile to appear in listings.',
} as const
