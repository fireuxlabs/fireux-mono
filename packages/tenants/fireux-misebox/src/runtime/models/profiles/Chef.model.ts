// packages/tenants/fireux-misebox/src/runtime/models/profiles/Chef.model.ts
import type {
  ProfileBase,
  ProfileConfig,
} from 'fireux-core/runtime/models/profiles/profile.model'

/** 🔹 Unified Chef (mirrors unified User shape) */
export interface Chef {
  id: string
  display_name?: string
  avatar?: string
  core: ChefCoreProfile | null
  app?: ChefAppProfile | null
}

/** Global doc: chefs/{uid} */
export interface ChefCoreProfile extends ProfileBase {
  display_name: string
  title?: string | null
  bioShort?: string | null
  bioLong?: string | null
  specialties?: string[]
}

/** App mirror: apps/{appId}/chefs/{uid} */
export interface ChefAppProfile extends ProfileBase {
  display_name: string
  title?: string | null
  bioShort?: string | null
  specialties?: string[]
}

/** 🔹 Shapes for rendering cards (parity with UserCard) */
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

/** 🔹 Config (slim, matches ProfileConfig) */
export const chefConfig: ProfileConfig = {
  id: 'chef',
  collectionName: 'chefs',
  profileType: 'Chef',
} as const
