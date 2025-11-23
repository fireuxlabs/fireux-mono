// @ts-nocheck
// Snapshot of packages/ecosystem/fireux-misebox/src/runtime/models/profiles/Chef.model.ts taken on 2025-11-03
import type {
  ProfileBase,
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

/** Global: chefs/{uid} */
export interface ChefCoreProfile extends ProfileBase {
  title?: string | null
  bio_short?: string | null
  bio_long?: string | null
  specialties?: string[]
}

/** App overlay: apps/{appId}/chefs/{uid} */
export interface ChefAppProfile extends ProfileBase {
  title?: string | null
  bio_short?: string | null
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
    bio_short?: string | null
    specialties?: string[]
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
