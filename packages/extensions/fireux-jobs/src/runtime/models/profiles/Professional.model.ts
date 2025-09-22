// packages/extensions/fireux-jobs/src/runtime/models/profiles/Professional.model.ts
import type {
  ProfileBase,
  ProfileConfig,
} from 'fireux-core/runtime/models/profiles/profile.model'

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
  bioShort?: string | null
  bioLong?: string | null
  specialties?: string[]
}

/** App overlay: apps/{appId}/professionals/{uid} */
export interface ProfessionalAppProfile extends ProfileBase {
  title?: string | null
  bioShort?: string | null
  specialties?: string[]
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
    bioShort?: string | null
    specialties?: string[]
  }
  export interface Profile extends Cell {
    bioLong?: string | null
  }
}

/** Config */
export const professionalConfig: ProfileConfig = {
  id: 'professional',
  collectionName: 'professionals',
  profileType: 'Professional',
  cta: 'Create your Professional profile to appear in listings.',
} as const
