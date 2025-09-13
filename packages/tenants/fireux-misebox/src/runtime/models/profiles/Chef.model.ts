/**
 * Base Profile interface — shared by all profile types
 */
export interface ProfileBase {
  uid: string
  created_at: Date | string
  updated_at?: Date | string

  // Standardized Avatar System
  avatarUrl: string
  avatar?: {
    path: string
    width?: number
    height?: number
    mimeType?: string
  }
}

/**
 * Core/global Chef profile: firestore -> chefs/{uid}
 */
export interface ChefCoreProfile extends ProfileBase {
  /** Required */
  chef_name: string

  /** Optional identity fields */
  title?: string
  bio_short?: string
  bio_long?: string

  /** Categorisation */
  specialties?: string[]
  cuisine_expertise?: string[]

  /** Extended content */
  gallery?: Array<{ name: string; image_url: string }>
  kitchens?: Record<string, { name: string; image_url: string }>

  /** Properties for cards/filters */
  years_experience?: number
  verified?: boolean
  available_for_hire?: boolean
  total_recipes?: number

  /** Optional governance flags */
  visibility?: 'public' | 'private' | 'unlisted'
}

/**
 * App-scoped Chef profile: firestore -> apps/{appId}/chefs/{uid}
 * Mirrors core but keeps app-only toggles/flags minimal.
 */
export interface ChefAppProfile extends ProfileBase {
  /** Whether enabled in this app */
  is_active: boolean

  /** App-specific tweaks */
  featured?: boolean
  badges?: string[]

  /** Pointer back to core chef doc (string form for lightweight linking) */
  core_ref_path?: `chefs/${string}`
}

/**
 * Validation + Config (keeps existing pattern)
 */
export function validateChefProfile(
  chef: Partial<ChefCoreProfile>
): boolean {
  return !!chef.chef_name
}

export const chefConfig = {
  id: 'chef',
  collectionName: 'chefs',
  profileType: 'Chef',
  color: 'orange',
  validationFn: validateChefProfile,
  requiredFields: ['chef_name'],
  searchableFields: ['chef_name', 'specialties', 'cuisine_expertise'],
  defaultValues: {
    specialties: [],
    cuisine_expertise: [],
    verified: false,
    available_for_hire: false,
    years_experience: 0,
  },
} as const

/**
 * Input/update helpers
 */
export type ChefInput = Omit<
  ChefCoreProfile,
  'uid' | 'created_at' | 'updated_at'
>
export type ChefUpdate = Partial<ChefInput>
