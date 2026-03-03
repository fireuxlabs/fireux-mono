import type { Timestamp } from 'firebase/firestore'

export const STITCH_PROVIDER_COLLECTION = 'stitch_providers'
export const STITCH_PROVIDER_TYPES = ['individual', 'agency'] as const
export const STITCH_PROVIDER_AVAILABILITY = ['available', 'limited', 'unavailable'] as const

export type StitchProviderType = (typeof STITCH_PROVIDER_TYPES)[number]
export type StitchProviderAvailability = (typeof STITCH_PROVIDER_AVAILABILITY)[number]
export type StitchTimestamp = Timestamp | Date | string | null

export interface StitchProvider {
  id: string
  display_name: string
  handle?: string
  type: StitchProviderType
  website_url?: string
  contact_email?: string
  location?: string
  timezone?: string
  languages?: string[]
  tags: string[]
  rate_hourly_min?: number
  rate_hourly_max?: number
  availability: StitchProviderAvailability
  bio?: string
  linkedin_url?: string
  created_at: StitchTimestamp
  updated_at: StitchTimestamp
  created_by_uid: string
  is_verified: boolean
  is_public: boolean
}

export type StitchProviderCreateInput = {
  display_name: string
  type: StitchProviderType
  website_url?: string
  contact_email?: string
  location?: string
  timezone?: string
  languages?: string[]
  tags?: string[]
  rate_hourly_min?: number
  rate_hourly_max?: number
  availability?: StitchProviderAvailability
  bio?: string
  linkedin_url?: string
  handle?: string
  is_public?: boolean
}

export type StitchProviderUpdateInput = Partial<StitchProviderCreateInput> & {
  is_verified?: boolean
}

export const STITCH_PROVIDER_TYPE_OPTIONS = STITCH_PROVIDER_TYPES.map((type) => ({ label: type, value: type }))
export const STITCH_PROVIDER_AVAILABILITY_OPTIONS = STITCH_PROVIDER_AVAILABILITY.map((availability) => ({
  label: availability,
  value: availability,
}))

export function createStitchProviderDraft(): StitchProviderCreateInput {
  return {
    display_name: '',
    type: 'individual',
    website_url: '',
    contact_email: '',
    location: '',
    timezone: '',
    languages: [],
    tags: [],
    availability: 'available',
    bio: '',
    linkedin_url: '',
    handle: '',
    is_public: true,
  }
}
