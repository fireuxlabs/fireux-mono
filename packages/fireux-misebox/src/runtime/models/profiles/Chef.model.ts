import type { Profile } from 'fireux-core/src/runtime/models/profiles/profile.model'

// Recipe Entry
export interface Recipe {
  id: string // Recipe ID
  title: string // Recipe title
  description: string // Recipe description
  cuisine_type: string // Type of cuisine
  difficulty: 'easy' | 'medium' | 'hard' // Difficulty level
  prep_time: number // Preparation time in minutes
  cook_time: number // Cooking time in minutes
  serves: number // Number of servings
  ingredients: string[] // List of ingredients
  instructions: string[] // Cooking instructions
  image_url?: string // Recipe image
  tags?: string[] // Recipe tags
  created_at: string | Date // When recipe was created
  published: boolean // Whether recipe is published
}

// Social Media Links
export interface SocialMedia {
  instagram?: string
  facebook?: string
  youtube?: string
  tiktok?: string
  website?: string
}

// Location for Chef Services
export interface ChefLocation {
  locations: Array<{
    lat: number // Latitude
    lng: number // Longitude
    formatted_address: string // Full address
  }>
  radius: string // Service radius in km
}

// Chef Experience (similar to Professional kitchen_experience)
export interface ChefExperience {
  name: string // Restaurant/venue name
  role: string // Chef position
  from_year: string // Start year
  from_month: string // Start month
  to_year?: string | null // End year
  to_month?: string | null // End month
  ongoing: boolean // Whether position is current
  description: string // Role description
  image_url?: string // Venue logo
  location?: string // Venue location
}

// Culinary Education
export interface CulinaryEducation {
  institution: string // Culinary school/institution
  program: string // Program or qualification
  start_year: string // Start year
  end_year: string // End year
  ongoing: boolean // Whether currently studying
  location?: string // Institution location
  image_url?: string // Institution logo
  certificate_url?: string // Certificate document
}

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

export interface Chef extends Profile {
  // Core Identity (required fields)
  id: string // Document ID in Firestore (same as uid for compatibility)
  chef_name: string // Chef's professional name (e.g., "Chef Deano", "Chef Marco")

  // Professional Identity
  title?: string // Chef title (e.g., "Executive Chef", "Pastry Chef")
  bio_short?: string // Short professional bio
  bio_long?: string // Detailed chef biography

  // Culinary Specialties
  specialties?: string[] // Cooking specialties and cuisine types
  cuisine_expertise?: string[] // Specific cuisines mastered
  cooking_styles?: string[] // Cooking styles (e.g., "Molecular", "Traditional", "Fusion")

  // Media & Portfolio (from actual database)
  gallery?: GalleryItem[] // Chef's gallery images
  kitchens?: Record<string, Kitchen> // Connected kitchens

  // Professional Background
  chef_experience?: ChefExperience[] // Professional kitchen experience
  culinary_education?: CulinaryEducation[] // Culinary training and education
  years_experience?: number // Total years as a chef

  // Recipe Portfolio
  recipes?: Recipe[] // Chef's recipe collection
  total_recipes?: number // Total number of recipes
  signature_dishes?: string[] // Chef's signature dishes

  // Social & Following
  total_followers?: number // Platform followers
  total_likes?: number // Total recipe likes
  social_media?: SocialMedia // Social media links

  // Service Information
  available_for_hire?: boolean // Whether available for bookings
  service_types?: string[] // Types of services offered (e.g., "Private Chef", "Catering", "Consulting")
  hourly_rate?: number // Hourly rate for services
  locations?: ChefLocation[] // Service locations

  // Portfolio & Media
  portfolio_images?: string[] // Portfolio image URLs
  video_introductions?: string[] // Introduction video URLs
  featured_media?: string[] // Featured media content

  // Achievements & Recognition
  awards?: string[] // Culinary awards and recognition
  certifications?: string[] // Professional certifications
  published_works?: string[] // Cookbooks, articles, etc.

  // System Fields
  updated_at?: string | Date // Last update date
  deleted?: boolean // Soft delete flag
  verified?: boolean // Whether chef is verified
}

export const chefConfig = {
  collectionName: 'chefs',
  profileType: 'Chef',
}
