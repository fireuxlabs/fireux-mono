import type {
  Profile,
  ProfileConfig,
} from 'fireux-core/runtime/models/core/profile.model.ts'

/** Unified Chef view (flattened convenience + partitions) */
export interface Chef {
  id: string
  display_name?: string
  avatar?: string
  core: ChefCoreProfile | null
  app?: ChefAppProfile | null
}

/** Domain Chef profile (global + overlays share this shape) */
export interface ChefProfile extends Profile {
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

/** Global: chefs/{uid} */
export type ChefCoreProfile = ChefProfile

/** App overlay: apps/{appId}/chefs/{uid} */
export type ChefAppProfile = ChefProfile

/** Card shapes */
export namespace ChefCard {
  export interface Pill {
    id: string
    display_name: string
    avatar?: string | null
    title?: string | null
  }
  export interface Cell extends Pill {
    bio_short?: string | null
    specialties?: string[]
    to?: string
  }
  export interface Profile extends Cell {
    bio_long?: string | null
  }
}

/** Config */
export const chefConfig: ProfileConfig = {
  id: 'chef',
  collectionName: 'chefs',
  profileType: 'Chef',
  cta: 'Create your Chef profile to appear in listings.',
} as const
