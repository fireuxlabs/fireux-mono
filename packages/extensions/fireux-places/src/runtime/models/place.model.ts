// FILE: packages/extensions/fireux-places/src/runtime/models/place.model.ts
// Concurrent edit — 2026-07-20 21:17 CEST — Place-root authority pass: distinguish sparse stored Place truth from resolved runtime display defaults.
// Concurrent edit — 2026-07-22 12:13 CEST — Place palette onboarding: make shared venue colours optional canonical Place truth.
// Concurrent edit — 2026-07-28 — Entity canon: declare Place as the independent shared location root.

import { defineFireuxEntity } from 'fireux-core/runtime/models/utils/entity.model'
import type { FireuxStamped } from 'fireux-core/runtime/models/utils/stamps.model'
import type { SparseBrandPalette } from 'fireux-core/runtime/models/utils/style.model'
import type { FirebaseTimestamp } from 'fireux-core/types/firebase'

/**
 * Executable canon: PlaceEntity below and scripts/_lib/entity-matrix.mjs.
 *
 * Family: Domain Root
 * Storage: root canonical model
 * Root path: /places/<placeId>
 * Console use: consoles may link to Place as shared location truth
 *
 * Decision note:
 * - Place is shared root location identity.
 * - Console entities like Kitchen can layer on top of Place without replacing it.
 * - If that changes later, update the models README first, then this file.
 */

export const PlaceStorage = {
  shape: 'public/root',
  path: 'places/{placeId}',
  collection: 'places',
  idParam: 'placeId',
} as const

export const PlaceEntity = defineFireuxEntity({
  kind: 'entity',
  name: 'Place',
  family: ['place'],
  identity: 'root',
  authority: 'owning-app-database',
  appSupport: 'none',
  publicRead: 'projection',
  console: false,
  root: PlaceStorage.path,
  notes: [
    'Place owns shared location identity independently of Kitchen, Company, Property, and Job relationships.',
    'Public consumers receive bounded projections rather than canonical Place roots.',
  ],
})

/** Canonical sources: google (provider), fireux (stored), manual (user-entered). */
export type PlaceSource = 'google' | 'fireux' | 'manual'

/**
 * Physical vs future non-physical workplaces.
 * - physical: real-world locations (typically Google-derived)
 * - non_physical: future manual workplaces (boats, trucks, festivals)
 */
export type PlaceType = 'physical' | 'non_physical'

/** Explicit backdrop behind transparent entity-owned brand media. */
export type MediaBackdropColor = `#${string}`
/** @deprecated Read-only compatibility for unmigrated records and consumers. */
export type PlaceImageShade = 'light' | 'dark' | 'none'

export type PlaceSocialLinks = {
  website: string
  instagram: string
  facebook: string
  tiktok: string
  linkedin: string
  youtube: string
}

export type PlaceAddress = {
  street: string
  city: string
  region: string
  postal_code: string
  country_code: string
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

/** Resolved runtime defaults. Firestore Place documents remain sparse. */
export const PlaceDefaults = {
  id: '' as string,

  // Primary identity
  name: '' as string,
  short_name: '' as string,
  brand_tagline: '' as string,
  about: '' as string,

  // Address + geo
  formatted_address: '' as string,
  short_address: '' as string,
  address: {
    street: '',
    city: '',
    region: '',
    postal_code: '',
    country_code: '',
  } as PlaceAddress,
  lat: 0 as number,
  lng: 0 as number,
  timezone: '' as string,

  // Media
  image_url: '' as string,
  cover_image: '' as string,
  gallery_images: [] as string[],
  media_backdrop_color: '' as MediaBackdropColor | '',
  /** @deprecated Never write; migrate to media_backdrop_color. */
  image_shade: 'none' as PlaceImageShade,

  // Portable brand colours inherited by Place-backed roles.
  brand_palette: {} as SparseBrandPalette,

  // Contact + presence
  phone: '' as string,
  email: '' as string,
  website: '' as string,
  google_maps_url: '' as string,
  social_links: {
    website: '',
    instagram: '',
    facebook: '',
    tiktok: '',
    linkedin: '',
    youtube: '',
  } as PlaceSocialLinks,

  // Classification
  /**
   * TODO: backfill existing docs with place_type = 'physical'.
   */
  place_type: 'physical' as PlaceType,
  types: [] as string[],
  tags: [] as string[],

  // Simple signals
  price_level: '' as string,
  default_currency_code: '' as string,
  business_hours: {
    windows: [],
  } as PlaceBusinessHours,

  /** Claimed owner (uid); empty string means unclaimed. */
  claimed_by: '' as string,
  verified: false as boolean,

  /** Optional public route locator. The document id remains canonical. */
  slug: '' as string,

  /** Projection only. Source of truth is the linked family record. */
  entity_families: [] as string[],

  source: 'fireux' as PlaceSource,

  /** How we found this place. */
  search_term: '' as string,

  created: {
    at: {} as FirebaseTimestamp,
    by: undefined as FireuxStamped['created']['by'],
  },
  updated: {
    at: {} as FirebaseTimestamp,
    by: undefined as FireuxStamped['created']['by'],
  },
} as const

export type Place = {
  [K in keyof typeof PlaceDefaults]: (typeof PlaceDefaults)[K]
}

/** Base shared by Google and Firestore. */
export type BasePlace = Pick<
  Place,
  | 'id'
  | 'name'
  | 'short_name'
  | 'place_type'
  | 'formatted_address'
  | 'short_address'
  | 'lat'
  | 'lng'
  | 'image_url'
  | 'image_shade'
  | 'claimed_by'
  | 'source'
  | 'slug'
>

/** Google Place (transient/provider). */
export type GooglePlace = BasePlace & {
  source: 'google'
  address: PlaceAddress
  website: string
  phone: string
  price_level: string
  google_maps_url: string
  types: string[]
  default_currency_code: string
  business_hours?: PlaceBusinessHours
}

export type PlaceStored = Pick<
  Place,
  'id' | 'name' | 'place_type' | 'source'
> & Partial<Omit<Place, 'id' | 'name' | 'place_type' | 'source'>>

export type PlaceCreateInput = Omit<PlaceStored, 'created' | 'updated'>
export type PlaceUpdateInput = Partial<Omit<Place, 'id' | 'created' | 'updated'>>

/** Create/update input used by Place create flows. */
export type PlaceUpsertInput = PlaceCreateInput
