import type {
  ProfileBase,
  ProfileConfig,
} from 'fireux-core/runtime/models/profiles/profile.model'

/** Unified Chef view (flattened convenience + partitions) */
export interface Chef {
  id: string
  display_name?: string
  avatar?: string
  core: ChefCoreProfile | null
  app?: ChefAppProfile | null
}

/** Global: chefs/{uid} */
export interface ChefCoreProfile extends ProfileBase {
  title?: string | null
  bioShort?: string | null
  bioLong?: string | null
  specialties?: string[]
}

/** App overlay: apps/{appId}/chefs/{uid} */
export interface ChefAppProfile extends ProfileBase {
  title?: string | null
  bioShort?: string | null
  specialties?: string[]
}

/** Card shapes */
export namespace ChefCard {
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
export const chefConfig: ProfileConfig = {
  id: 'chef',
  collectionName: 'chefs',
  profileType: 'Chef',
  cta: 'Create your Chef profile to appear in listings.',
} as const
