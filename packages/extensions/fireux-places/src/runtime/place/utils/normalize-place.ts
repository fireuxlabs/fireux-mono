import { isFirestoreDocumentId } from 'fireux-core/runtime/utils/firestoreDocumentId'
import type {
  Place,
  PlaceAddress,
  PlaceSocialLinks,
} from '../models/place.model.ts'
import {
  normalizePlaceBusinessHours,
  readMediaBackdropColor,
} from './place-spine'

export const PlaceDefaults: Place = {
  id: '',
  slug: '',
  name: '',
  short_name: '',
  brand_tagline: '',
  about: '',
  address: { street: '', city: '', region: '', postal_code: '', country_code: '' },
  formatted_address: '',
  short_address: '',
  lat: 0,
  lng: 0,
  timezone: '',
  image_url: '',
  cover_image: '',
  logo_image: '',
  wordmark_image: '',
  gallery_images: [],
  media_backdrop_color: '',
  phone: '',
  email: '',
  website: '',
  google_maps_url: '',
  social_links: { instagram: '', facebook: '', tiktok: '', linkedin: '', youtube: '' },
  place_type: 'physical',
  types: [],
  tags: [],
  price_level: '',
  default_currency_code: '',
  business_hours: { windows: [] },
  claimed_by: '',
  verified: false,
  source: 'fireux',
}

const record = (value: unknown): Record<string, unknown> =>
  value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {}

/**
 * Resolve sparse stored Place truth into the one canonical runtime Place.
 * Unknown stored fields remain available; defaults only complete known fields.
 */
export function normalizePlace(idValue: unknown, value: unknown): Place | null {
  const id = String(idValue ?? '').trim()
  const source = record(value)
  const name = String(source.name ?? '').trim()
  const placeType = String(source.place_type ?? '').trim()
  if (
    !isFirestoreDocumentId(id) ||
    !name ||
    (placeType !== 'physical' && placeType !== 'non_physical')
  ) {
    return null
  }

  return {
    ...PlaceDefaults,
    ...source,
    id,
    name,
    place_type: placeType,
    address: {
      ...PlaceDefaults.address,
      ...record(source.address),
    } as PlaceAddress,
    social_links: {
      ...PlaceDefaults.social_links,
      ...record(source.social_links),
    } as PlaceSocialLinks,
    business_hours: normalizePlaceBusinessHours(source.business_hours) || {
      windows: [],
    },
    media_backdrop_color: readMediaBackdropColor(
      source.media_backdrop_color,
      source.image_shade
    ),
    gallery_images: Array.isArray(source.gallery_images)
      ? source.gallery_images
      : [],
    types: Array.isArray(source.types) ? source.types : [],
    tags: Array.isArray(source.tags) ? source.tags : [],
  } as Place
}
