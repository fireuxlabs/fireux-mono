import {
  PUBLIC_PLACE_PROJECTION_KEYS,
  type PublicPlaceProjection,
} from '../models/place-public.model'
import type { PlaceType } from '../models/place.model'
import { readMediaBackdropColor } from './place-spine'

const text = (value: unknown) => String(value ?? '').trim()

const placeType = (value: unknown): PlaceType | '' => {
  const candidate = text(value)
  return candidate === 'physical' || candidate === 'non_physical'
    ? candidate
    : ''
}

export function normalizePublicPlaceProjection(
  value: Record<string, unknown>
): PublicPlaceProjection | null {
  const id = text(value.id)
  const name = text(value.name)
  const type = placeType(value.place_type)
  if (!id || !name || !type) return null

  return {
    id,
    name,
    place_type: type,
    short_name: text(value.short_name),
    brand_tagline: text(value.brand_tagline),
    short_address: text(value.short_address),
    image_url: text(value.image_url),
    media_backdrop_color: readMediaBackdropColor(
      value.media_backdrop_color,
      value.image_shade
    ),
    image_shade: text(value.image_shade) === 'light'
      ? 'light'
      : text(value.image_shade) === 'dark'
        ? 'dark'
        : 'none',
    verified: value.verified === true,
    slug: text(value.slug),
  }
}

export function hasExactPublicPlaceProjectionShape(
  value: Record<string, unknown>
) {
  const keys = Object.keys(value).sort()
  const expected = [...PUBLIC_PLACE_PROJECTION_KEYS].sort()
  return (
    keys.length === expected.length &&
    keys.every((key, index) => key === expected[index])
  )
}
