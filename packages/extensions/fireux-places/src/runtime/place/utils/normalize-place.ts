import { isFirestoreDocumentId } from 'fireux-core/runtime/utils/firestoreDocumentId'
import type { FirebaseTimestamp } from 'fireux-core/types/firebase'
import { readBrandPalette } from 'fireux-core/runtime/utils/brand-palette'
import type {
  Place,
  PlaceSource,
  PlaceStamp,
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
  brand_palette: {},
  place_type: 'physical',
  types: [],
  tags: [],
  entity_families: [],
  search_term: '',
  price_level: '',
  default_currency_code: '',
  business_hours: { windows: [] },
  claimed_by: '',
  verified: false,
  source: 'fireux',
  created: { at: {} as FirebaseTimestamp },
  updated: { at: {} as FirebaseTimestamp },
}

const record = (value: unknown): Record<string, unknown> =>
  value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {}

const text = (value: unknown) => String(value ?? '').trim()
const number = (value: unknown) => {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}
const strings = (value: unknown) =>
  Array.isArray(value) ? value.map(text).filter(Boolean) : []
const stamp = (value: unknown): PlaceStamp => {
  const source = record(value)
  return {
    at: (source.at || {}) as FirebaseTimestamp,
    ...(text(source.by) ? { by: text(source.by) } : {}),
    ...(text(source.app_id) ? { app_id: text(source.app_id) } : {}),
  }
}
const placeSource = (value: unknown): PlaceSource => {
  const source = text(value)
  return source === 'google' || source === 'manual' || source === 'fireux'
    ? source
    : 'fireux'
}

/**
 * Resolve sparse stored Place truth into the one canonical runtime Place.
 * Unknown stored fields remain available; defaults only complete known fields.
 */
export function normalizePlace(idValue: unknown, value: unknown): Place | null {
  const id = String(idValue ?? '').trim()
  const source = record(value)
  const name = text(source.name)
  const placeType = text(source.place_type)
  if (
    !isFirestoreDocumentId(id) ||
    !name ||
    (placeType !== 'physical' && placeType !== 'non_physical')
  ) {
    return null
  }

  return {
    id,
    slug: text(source.slug),
    name,
    short_name: text(source.short_name),
    brand_tagline: text(source.brand_tagline),
    about: text(source.about),
    address: {
      street: text(record(source.address).street),
      city: text(record(source.address).city),
      region: text(record(source.address).region),
      postal_code: text(record(source.address).postal_code),
      country_code: text(record(source.address).country_code),
    },
    formatted_address: text(source.formatted_address),
    short_address: text(source.short_address),
    lat: number(source.lat),
    lng: number(source.lng),
    timezone: text(source.timezone),
    image_url: text(source.image_url),
    cover_image: text(source.cover_image),
    logo_image: text(source.logo_image),
    wordmark_image: text(source.wordmark_image),
    gallery_images: strings(source.gallery_images),
    media_backdrop_color: readMediaBackdropColor(
      source.media_backdrop_color,
      source.image_shade
    ),
    phone: text(source.phone),
    email: text(source.email),
    website: text(source.website),
    google_maps_url: text(source.google_maps_url),
    social_links: {
      instagram: text(record(source.social_links).instagram),
      facebook: text(record(source.social_links).facebook),
      tiktok: text(record(source.social_links).tiktok),
      linkedin: text(record(source.social_links).linkedin),
      youtube: text(record(source.social_links).youtube),
    },
    brand_palette: readBrandPalette(source.brand_palette),
    place_type: placeType,
    types: strings(source.types),
    tags: strings(source.tags),
    entity_families: strings(source.entity_families),
    search_term: text(source.search_term),
    price_level: text(source.price_level),
    default_currency_code: text(source.default_currency_code),
    business_hours: normalizePlaceBusinessHours(source.business_hours) || {
      windows: [],
    },
    claimed_by: text(source.claimed_by),
    verified: source.verified === true,
    source: placeSource(source.source),
    created: stamp(source.created),
    updated: stamp(source.updated),
  }
}
