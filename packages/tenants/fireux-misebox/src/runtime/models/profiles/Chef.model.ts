import type {
  Profile,
  ProfileConfig,
} from 'fireux-core/src/runtime/models/profiles/profile.model'

// Gallery Item (from actual database)
export interface GalleryItem {
  name: string // Image name/title
  image_url: string // Image URL
}

// Kitchen Connection (from actual database)
export interface Kitchen {
  name: string // Kitchen name
  image_url: string // Kitchen image
}

// Minimal Chef interface - matching real data
export interface Chef extends Profile {
  chef_name: string // Chef's professional name (required)

  // Core fields (all chefs have these)
  title?: string // Chef title (Executive Chef, Head Chef, etc.)
  bio_short?: string // Short bio
  specialties?: string[] // Cooking specialties array

  // Extended fields (some chefs have these)
  bio_long?: string // Detailed biography
  gallery?: GalleryItem[] // Chef's gallery images
  kitchens?: Record<string, Kitchen> // Connected kitchens

  // Properties for card component compatibility
  profile_image?: { url: string } // Profile image
  years_experience?: number // Years of experience
  verified?: boolean // Verification status
  available_for_hire?: boolean // Availability
  cuisine_expertise?: string[] // Cuisine types

  // Recipe properties for filtering
  total_recipes?: number // Total number of recipes
} // Minimal validation - just check required fields
export function validateChefProfile(chef: Partial<Chef>): boolean {
  return !!chef.chef_name
}

// Minimal Chef Configuration
export const chefConfig: ProfileConfig = {
  collectionName: 'chefs',
  profileType: 'Chef',
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
}

// Export minimal types
export type ChefInput = Omit<Chef, 'uid' | 'created_at' | 'updated_at'>
export type ChefUpdate = Partial<ChefInput>
