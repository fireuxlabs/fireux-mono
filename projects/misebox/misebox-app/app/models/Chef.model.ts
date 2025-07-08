export interface Chef {
  id?: string // Document ID in Firestore
  uid: string // Matches AppUser.uid - the core identity link

  // Professional Chef Identity
  avatar?: string // Chef's professional avatar (separate from AppUser avatar)
  chef_name?: string // Professional chef name (may differ from AppUser display_name)
  title?: string // Chef title/role (e.g., "Sous Chef", "Head Chef", "Baker")
  bio_short?: string // Short chef bio description
  bio_long?: string // Detailed chef biography

  // Kitchen Experience and Background
  kitchen_experience?: Array<{
    kitchen_name: string
    role: string
    from_year: string
    from_month?: string
    to_year?: string | null
    to_month?: string | null
    ongoing: boolean
    responsibilities: string
    cuisine_types?: string[]
    image_url?: string
    place_id?: string // Google Places ID for location
    formatted_address?: string
    short_address?: string
  }>

  // Culinary Skills and Specialties
  specialties?: string[] // Cuisine types, cooking methods, dietary specializations
  signature_dishes?: string[] // Chef's signature or specialty dishes
  dietary_accommodations?: string[] // Vegan, gluten-free, keto, etc.

  // Certifications and Education
  certifications?: Array<{
    name: string // e.g., "ServSafe Food Handler", "Culinary Arts Degree"
    year: string
    issuing_organization: string
    image_url?: string
    document_url?: string
    expiry_date?: string
  }>

  education?: Array<{
    institution: string
    degree: string // e.g., "Culinary Arts", "Hospitality Management"
    start_year: string
    end_year: string
    ongoing: boolean
    image_url?: string
    document_url?: string
    gpa?: string
    honors?: string
  }>

  // Availability and Work Preferences
  availability?: {
    monday?: { start: string; end: string; available: boolean }
    tuesday?: { start: string; end: string; available: boolean }
    wednesday?: { start: string; end: string; available: boolean }
    thursday?: { start: string; end: string; available: boolean }
    friday?: { start: string; end: string; available: boolean }
    saturday?: { start: string; end: string; available: boolean }
    sunday?: { start: string; end: string; available: boolean }
  }

  preferred_shift_types?: string[] // "morning", "evening", "weekend", "holiday"
  willing_to_travel?: boolean
  travel_radius_km?: number

  // Portfolio and Social Presence
  portfolio_images?: string[] // URLs to chef's work photos
  social_links?: {
    instagram?: string
    tiktok?: string
    youtube?: string
    linkedin?: string
    personal_website?: string
  }

  // Equipment and Skills
  equipment_expertise?: string[] // "wood-fired oven", "molecular gastronomy", "butchery"
  languages?: Array<{
    language: string
    proficiency: string // "native", "fluent", "conversational", "basic"
  }>

  // Professional Status
  employment_status?: 'available' | 'employed' | 'freelance' | 'not_available'
  hourly_rate_min?: number
  hourly_rate_max?: number
  currency?: string // "USD", "EUR", etc.

  // Verification and Trust
  background_check_verified?: boolean
  references?: Array<{
    name: string
    position: string
    company: string
    phone?: string
    email?: string
    relationship: string // "former_manager", "colleague", "mentor"
  }>

  // Kitchen Affiliations (if currently working)
  current_kitchen_id?: string // Reference to Kitchen document
  current_role?: string
  start_date?: Date | string

  // Timestamps and System Fields
  created_at: Date | string
  updated_at?: Date | string
  deleted?: boolean

  // Analytics and Performance
  jobs_completed?: number
  average_rating?: number
  total_reviews?: number
  reliability_score?: number
}
