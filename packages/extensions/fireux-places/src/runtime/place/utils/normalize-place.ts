import { isFirestoreDocumentId } from 'fireux-core/runtime/utils/firestoreDocumentId'
import {
  PlaceDefaults,
  type Place,
  type PlaceAddress,
  type PlaceSocialLinks,
} from '../models/place.model.ts'
import {
  normalizePlaceBusinessHours,
  readMediaBackdropColor,
} from './place-spine'

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
    entity_families: Array.isArray(source.entity_families)
      ? source.entity_families
      : [],
  } as Place
}
