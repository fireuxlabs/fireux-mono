import type { FirebaseTimestamp } from 'fireux-core/types/firebase'
import type { SparseBrandPalette } from 'fireux-core/runtime/models/utils/style.model'

export type PlaceSource = 'google' | 'fireux' | 'manual'
export type PlaceType = 'physical' | 'non_physical'

export type PlaceAddress = {
  street: string
  city: string
  region: string
  postal_code: string
  country_code: string
}

export type PlaceSocialLinks = {
  instagram: string
  facebook: string
  tiktok: string
  linkedin: string
  youtube: string
}

export type PlaceBusinessHoursDay =
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday'
  | 'saturday'
  | 'sunday'

export type PlaceBusinessHoursWindow = {
  days: PlaceBusinessHoursDay[]
  open: string
  close: string
}

export type PlaceBusinessHours = {
  windows: PlaceBusinessHoursWindow[]
}

export type PlaceStamp = {
  at: FirebaseTimestamp
  by?: string
  app_id?: string
}

export type Place = {
  id: string
  slug: string
  name: string
  short_name: string
  tagline: string
  about: string
  address: PlaceAddress
  formatted_address: string
  short_address: string
  lat: number
  lng: number
  timezone: string
  image_url: string
  cover_image: string
  logo_image: string
  wordmark_image: string
  gallery_images: string[]
  media_backdrop_color: `#${string}` | ''
  phone: string
  email: string
  website: string
  google_maps_url: string
  social_links: PlaceSocialLinks
  brand_palette: SparseBrandPalette
  place_type: PlaceType
  types: string[]
  tags: string[]
  entity_families: string[]
  search_term: string
  price_level: string
  default_currency_code: string
  business_hours: PlaceBusinessHours
  claimed_by: string
  verified: boolean
  source: PlaceSource
  created: PlaceStamp
  updated: PlaceStamp
}
