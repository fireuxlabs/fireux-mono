import type { PlaceSource } from '../../../../models/place.model.ts'
import type { PlaceImageShade } from '../../../../utils/place-spine'
import { canonicalPlaceId } from '../../fetch/google/usePlacesGoogle'
import type { BasePlace, BasePlaceRecord, MapToBasePlace } from '../../fetch/search/types'

function toSource(value: unknown): PlaceSource {
  const v = String(value ?? '').toLowerCase().trim()
  if (v === 'google' || v === 'manual' || v === 'fireux') return v
  return 'fireux'
}

function toShade(value: unknown): PlaceImageShade {
  const v = String(value ?? 'none').toLowerCase().trim()
  if (v === 'light' || v === 'dark' || v === 'none') return v
  return 'none'
}

function toNumber(value: unknown): number {
  const n = typeof value === 'number' ? value : Number(String(value ?? '').trim())
  return Number.isFinite(n) ? n : 0
}

function toString(value: unknown): string {
  return typeof value === 'string' ? value : String(value ?? '')
}

function toStrings(value: unknown): string[] {
  return Array.isArray(value)
    ? value.map(toString).map((item) => item.trim()).filter(Boolean)
    : []
}

export const mapPlaceToBasePlace = (): MapToBasePlace => {
  return (p: any, collectionOverride?: string): BasePlaceRecord => {
    const id = canonicalPlaceId(toString(p?.place_id ?? p?.id)) ?? ''
    const source = toSource(p?.source)

    const base: BasePlace = {
      id,
      name: toString(p?.name).trim(),
      short_name: toString(p?.short_name).trim(),
      place_type: (toString(p?.place_type).trim() || 'physical') as BasePlace['place_type'],
      formatted_address: toString(p?.formatted_address).trim(),
      short_address: toString(p?.short_address).trim(),
      lat: toNumber(p?.lat),
      lng: toNumber(p?.lng),
      image_url: toString(p?.image_url ?? p?.place_image).trim(),
      claimed_by: toString(p?.claimed_by).trim(),
      image_shade: toShade(p?.image_shade),
      source,
      slug: toString(p?.slug).trim(),
      entity_families: toStrings(p?.entity_families),
    }

    return {
      ...base,
      collection:
        collectionOverride ?? (typeof p?.collection === 'string' ? p.collection : undefined),
    }
  }
}
