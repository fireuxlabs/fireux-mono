import type { Place } from './place.model.ts'

/** Minimum Place-owned identity needed by the shared brand-led header. */
export type PlaceHeaderPresentation = Pick<
  Place,
  | 'brand_palette'
  | 'brand_tagline'
  | 'cover_image'
  | 'google_maps_url'
  | 'image_url'
  | 'logo_image'
  | 'media_backdrop_color'
  | 'name'
  | 'place_type'
  | 'short_address'
  | 'short_name'
  | 'verified'
  | 'website'
  | 'wordmark_image'
>
