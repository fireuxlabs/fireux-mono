export interface Professional {
  uid: string // Firestore document ID (matches AppUser.uid)
  // NOTE: Name fields are fetched from AppUser - no duplication

  // Professional-specific identity
  avatar?: string // Professional avatar (separate from AppUser avatar)
  title?: string // Professional title/role (e.g., "Sous Chef", "Freelancer")
  bio_short?: string // Short bio description
  bio_long?: string // Long bio description
  created_at: Date | string // Creation timestamp

  // Experience and background
  kitchen_experience?: Array<{
    name: string
    role: string
    from_year: string
    from_month?: string
    to_year?: string | null
    to_month?: string | null
    ongoing: boolean
    responsibilities: string
    image_url?: string
    place_id?: string
    formatted_address?: string
    short_address?: string
  }>

  // Skills and qualifications
  languages?: Array<{
    language: string
    proficiency: string
  }>

  certifications?: Array<{
    name: string
    year: string
    place_name: string
    image_url?: string
    document_url?: string
    formatted_address?: string
  }>

  education?: Array<{
    institution: string
    degree: string
    start_year: string
    end_year: string
    ongoing: boolean
    image_url?: string
    document_url?: string
    formatted_address?: string
  }>

  // Projects and other experience
  projects?: Array<{
    name: string
    role: string
    from_year: string
    to_year?: string | null
    ongoing: boolean
    responsibilities: string
  }>

  other_employment_experience?: Array<{
    name: string
    role: string
    from_year: string
    from_month: string
    ongoing: boolean
    responsibilities: string
    image_url?: string
    place_id?: string
    formatted_address?: string
  }>

  volunteering?: Array<{
    organization: string
    role: string
    from_year: string
    to_year: string
    ongoing: boolean
    responsibilities: string
  }>

  // Location
  locations?: Array<{
    radius: string
    locations: Array<{
      lat: number
      lng: number
      formatted_address: string
    }>
  }>

  // Contact information
  email?: string

  // Other fields
  avatarUrl?: string
  updated_at?: unknown // Required for Firestore updateDocument function
}
