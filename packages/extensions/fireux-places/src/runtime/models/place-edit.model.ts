import type { SparseBrandPalette } from 'fireux-core/runtime/models/utils/style.model'
import type {
  PlaceAssets,
  PlaceBusinessHours,
  PlaceSocialLinks,
  PlaceSource,
  PlaceType,
} from './place.model'

/** Authenticated, owner-editable Place projection. Never use as a public DTO. */
export type PlaceEditProjection = {
  id: string
  name: string
  place_type: PlaceType
  source: PlaceSource
  verified: boolean
  slug: string
  short_name: string
  brand_tagline: string
  about: string
  formatted_address: string
  short_address: string
  search_term: string
  lat: number | null
  lng: number | null
  assets: PlaceAssets
  brand_palette: SparseBrandPalette
  phone: string
  email: string
  website: string
  social_links: Partial<PlaceSocialLinks>
  default_currency_code: string
  timezone: string
  business_hours: PlaceBusinessHours
}
