import type {
  Profile,
  ProfileConfig,
} from 'fireux-core/models/profiles/profile.model'

// Kitchen Experience Entry
export interface KitchenExperience {
  name: string // Restaurant/venue name
  role: string // Job title (e.g., "Chef de Partie", "Sous Chef", "Head Chef")
  from_year: string // Start year
  from_month: string // Start month
  to_year?: string | null // End year (null if ongoing)
  to_month?: string | null // End month (null if ongoing)
  ongoing: boolean // Whether position is current
  responsibilities: string // Detailed description of role and responsibilities
  image_url?: string // Logo/image of the establishment
  place_id?: string // Google Places ID
  short_address?: string // Short address format
  formatted_address?: string // Full formatted address
}

// Language Proficiency
export interface Language {
  language: string // Language name (e.g., "English", "French")
  proficiency: string // Level (e.g., "Native", "C1", "B2", "A1")
}

// Location with Radius
export interface ProfessionalLocation {
  locations: Array<{
    lat: number // Latitude
    lng: number // Longitude
    formatted_address: string // Full address
  }>
  radius: string // Search radius in km
}

// Education Entry
export interface Education {
  institution: string // University/school name
  degree: string // Degree/qualification name
  start_year: string // Start year
  end_year: string // End year
  ongoing: boolean // Whether currently studying
  image_url?: string // Institution logo
  formatted_address?: string // Institution address
  document_url?: string // Certificate/document URL
}

// Certification Entry
export interface Certification {
  name: string // Certification name
  year: string // Year obtained
  place_name?: string // Issuing organization
  formatted_address?: string // Organization address
  image_url?: string // Organization logo
  document_url?: string // Certificate document URL
}

// Project Entry
export interface Project {
  name: string // Project name
  role: string // Role in project
  from_year: string // Start year
  to_year?: string | null // End year (null if ongoing)
  ongoing: boolean // Whether project is current
  responsibilities: string // Project description and responsibilities
}

// Volunteering Entry
export interface Volunteering {
  organization: string // Organization name
  role: string // Volunteer role
  from_year: string // Start year
  to_year?: string // End year
  ongoing: boolean // Whether currently volunteering
  responsibilities: string // Description of volunteer work
}

// Other Employment Entry
export interface OtherEmployment {
  name: string // Company/organization name
  role: string // Job title
  from_year: string // Start year
  from_month: string // Start month
  to_year?: string | null // End year (null if ongoing)
  to_month?: string | null // End month (null if ongoing)
  ongoing: boolean // Whether position is current
  responsibilities: string // Job description and responsibilities
  image_url?: string // Company logo
  place_id?: string // Google Places ID
  formatted_address?: string // Company address
}

export interface Professional extends Profile {
  // Core Identity (required fields)
  professional_name: string // Full professional name (e.g., "Daniel Mark Watson")

  // Basic Identity (inherited from core profile)
  email: string // Email address
  title?: string // Professional title/role
  bio_short?: string // Short bio description
  bio_long?: string // Detailed biography

  // Professional Experience
  kitchen_experience?: KitchenExperience[] // Kitchen work history
  other_employment_experience?: OtherEmployment[] // Non-kitchen employment
  projects?: Project[] // Special projects and initiatives
  volunteering?: Volunteering[] // Volunteer work

  // Education & Certifications
  education?: Education[] // Educational background
  certifications?: Certification[] // Professional certifications
  languages?: Language[] // Language skills

  // Location & Availability
  locations?: ProfessionalLocation[] // Work locations and radius

  // System Fields
  uid: string // Firebase UID
  created_at: string | Date // Profile creation date
  updated_at?: string | Date // Last update date
  deleted?: boolean // Soft delete flag
}

// Professional validation functions
export function validateProfessionalProfile(
  professional: Partial<Professional>
): boolean {
  return !!(professional.professional_name && professional.email)
}

export function validateKitchenExperience(
  experience: Partial<KitchenExperience>
): boolean {
  return !!(experience.name && experience.role && experience.from_year)
}

// Professional Profile Configuration with enhanced functionality
export const professionalConfig: ProfileConfig = {
  id: 'professional',
  collectionName: 'professionals',
  profileType: 'Professional',
  color: 'blue',

  // Validation function
  validationFn: validateProfessionalProfile,

  // Required fields for profile creation
  requiredFields: ['professional_name', 'email'],

  // Searchable fields for profile discovery
  searchableFields: [
    'professional_name',
    'title',
    'cuisine_types',
    'locations',
  ],

  // Default values for new professional profiles
  defaultValues: {
    cuisine_types: [],
    languages: [],
    kitchen_experience: [],
    certifications: [],
    availability: {
      monday: false,
      tuesday: false,
      wednesday: false,
      thursday: false,
      friday: false,
      saturday: false,
      sunday: false,
    },
    verified: false,
    featured: false,
  },
}

// CTA Configuration for Professional profiles
export const professionalCtaConfig = {
  title: '👨‍🍳 Launch Your Culinary Career',
  description:
    'Join our platform as a Professional to showcase your kitchen expertise, connect with top employers, and advance your culinary career.',
  benefits: [
    '✨ Create and manage your professional profile',
    '🏆 Showcase your kitchen experience and skills',
    '📄 Display certifications and education',
    '🤝 Connect with restaurants and employers',
  ],
  createPath: '/professionals/create',
  createButtonText: 'Create Professional Profile',
  welcomeBackText: '👨‍🍳 Welcome back, Professional!',
  quickActions: [
    { text: 'View Jobs', path: '/jobs' },
    { text: 'Browse Employers', path: '/employers' },
  ],
}

// Export types for easier importing
export type ProfessionalInput = Omit<
  Professional,
  'uid' | 'created_at' | 'updated_at'
>
export type ProfessionalUpdate = Partial<ProfessionalInput>
