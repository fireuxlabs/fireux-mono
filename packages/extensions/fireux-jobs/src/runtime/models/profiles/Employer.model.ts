import type {
  Profile,
  ProfileConfig,
} from 'fireux-core/src/runtime/models/profiles/profile.model'

// Company Location
export interface CompanyLocation {
  locations: Array<{
    lat: number // Latitude
    lng: number // Longitude
    formatted_address: string // Full address
  }>
  radius?: string // Service radius in km (optional)
}

// Job Opening
export interface JobOpening {
  id: string // Job ID
  title: string // Job title
  role: string // Specific role (e.g., "Sous Chef", "Kitchen Manager")
  location: string // Job location
  type: 'full-time' | 'part-time' | 'contract' | 'temporary' // Employment type
  salary_range?: string // Salary range (e.g., "50k-60k CHF")
  description: string // Job description
  requirements: string[] // Job requirements
  benefits?: string[] // Job benefits
  posted_at: string | Date // When job was posted
  expires_at?: string | Date // Job expiration date
  active: boolean // Whether job is active
}

// Company Contact
export interface CompanyContact {
  name: string // Contact person name
  title: string // Contact person title
  email: string // Contact email
  phone?: string // Contact phone
}

export interface Employer extends Profile {
  // Core Identity (required fields)
  company_name: string // Official company name (e.g., "Misebox Kitchen")

  // Basic Identity
  email: string // Primary contact email

  // Company Information
  business_type?: string // Type of business (e.g., "Restaurant", "Hotel", "Catering")
  title?: string // Contact person title
  bio_short?: string // Short company description
  bio_long?: string // Detailed company description

  // Company Details
  specialties?: string[] // Business specialties (e.g., "Fine Dining", "Events", "Hotels")
  cuisine_types?: string[] // Types of cuisine served
  establishment_type?: string[] // Type of establishment (e.g., "Restaurant", "Bar", "Hotel")

  // Business Stats
  employee_count?: number // Number of employees
  years_established?: number // Years in business
  covers_per_service?: number // Average covers per service
  annual_revenue?: string // Annual revenue range

  // Location & Operations
  locations?: CompanyLocation[] // Business locations
  operating_hours?: {
    [key: string]: {
      // Day of week
      open: string // Opening time
      close: string // Closing time
      closed?: boolean // Whether closed this day
    }
  }

  // Job Management
  active_jobs?: JobOpening[] // Current job openings
  total_jobs_posted?: number // Total jobs posted historically

  // Contact Information
  contacts?: CompanyContact[] // Additional contacts
  website?: string // Company website
  social_media?: {
    instagram?: string
    facebook?: string
    linkedin?: string
    twitter?: string
  }

  // Verification & Credentials
  verified?: boolean // Whether company is verified
  business_license?: string // Business license number
  tax_id?: string // Tax identification number

  // System Fields
  uid: string // Firebase UID
  created_at: string | Date // Profile creation date
  updated_at?: string | Date // Last update date
  deleted?: boolean // Soft delete flag
}

// Employer validation functions
export function validateEmployerProfile(employer: Partial<Employer>): boolean {
  return !!(
    employer.company_name &&
    employer.business_type &&
    employer.locations
  )
}

export function validateJobOpening(job: Partial<JobOpening>): boolean {
  return !!(job.title && job.role && job.location && job.type)
}

// Employer Profile Configuration with enhanced functionality
export const employerConfig: ProfileConfig = {
  id: 'employer',
  collectionName: 'employers',
  profileType: 'Employer',
  color: 'red',

  // Validation function
  validationFn: validateEmployerProfile,

  // Required fields for profile creation
  requiredFields: ['company_name', 'business_type', 'locations'],

  // Searchable fields for profile discovery
  searchableFields: [
    'company_name',
    'business_type',
    'company_size',
    'locations',
  ],

  // Default values for new employer profiles
  defaultValues: {
    job_openings: [],
    benefits: [],
    company_culture: [],
    verified: false,
    featured: false,
  },
}

// CTA Configuration for Employer profiles
export const employerCtaConfig = {
  title: '🏢 Find Your Perfect Team',
  description:
    'Join our platform as an Employer to connect with skilled culinary professionals, post job openings, and build your dream kitchen team.',
  benefits: [
    '✨ Create and manage your company profile',
    '📋 Post and manage job openings',
    '👥 Connect with skilled culinary professionals',
    '🎯 Find the perfect candidates for your team',
  ],
  createPath: '/employers/create',
  createButtonText: 'Create Employer Profile',
  welcomeBackText: '🏢 Welcome back, Employer!',
  quickActions: [
    { text: 'Post Job', path: '/jobs/create' },
    { text: 'Browse Professionals', path: '/professionals' },
  ],
}

// Export types for easier importing
export type EmployerInput = Omit<Employer, 'uid' | 'created_at' | 'updated_at'>
export type EmployerUpdate = Partial<EmployerInput>
