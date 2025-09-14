// Minimal local copies to avoid alias issues
export interface ProfileBase {
  id?: string
  created_at?: string
  updated_at?: string
}
export interface ProfileConfig {
  id: string
  collectionName: string
  profileType: string
  color: string
  validationFn: (p: any) => boolean
  requiredFields: string[]
  searchableFields: string[]
  defaultValues?: Record<string, any>
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

  /** Optional media */
  profile_image?: { url?: string }

  /** Properties for cards/filters */
  years_experience?: number
  verified?: boolean
  available_for_hire?: boolean
  total_recipes?: number

  /** Extended resume-like fields used in UI (optional) */
  chef_experience?: Array<{
    name: string
    role?: string
    from_month?: string
    from_year?: string | number
    to_month?: string
    to_year?: string | number
    ongoing?: boolean
    description?: string
    image_url?: string
  }>
  culinary_education?: Array<{
    institution: string
    program?: string
    start_year?: string | number
    end_year?: string | number
    ongoing?: boolean
    image_url?: string
  }>
  awards?: string[]
  certifications?: string[]
  social_media?: {
    instagram?: string
    facebook?: string
    youtube?: string
    website?: string
  }

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
export function validateChefProfile(chef: Partial<ChefCoreProfile>): boolean {
  return !!chef.chef_name
}

export const chefConfig: ProfileConfig = {
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
  'id' | 'created_at' | 'updated_at'
>
export type ChefUpdate = Partial<ChefInput>
