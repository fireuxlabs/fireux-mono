import { readBrandPalette } from 'fireux-core/runtime/utils/brand-palette'
import type { PlaceEditProjection } from '../../models/place-edit.model'
import type { PlaceSource, PlaceType } from '../../models/place.model'
import {
  normalizePlaceBusinessHours,
  normalizePlaceCurrencyCode,
  normalizePlaceTimezone,
  readPlaceAssets,
} from '../../utils/place-spine'

const text = (value: unknown, max = 10_000) =>
  typeof value === 'string' ? value.trim().slice(0, max) : ''
const record = (value: unknown): Record<string, unknown> =>
  value && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {}
const url = (value: unknown) => {
  const candidate = text(value, 2_048)
  if (!candidate) return ''
  try {
    const parsed = new URL(candidate)
    return parsed.protocol === 'https:' && !parsed.username && !parsed.password
      ? parsed.toString()
      : ''
  } catch {
    return ''
  }
}
const coordinate = (value: unknown, min: number, max: number) =>
  typeof value === 'number' && Number.isFinite(value) && value >= min && value <= max
    ? value
    : null

export function projectPlaceEdit(
  id: string,
  value: Record<string, unknown>
): PlaceEditProjection {
  const assets = readPlaceAssets(value)
  const source = ['google', 'fireux', 'manual'].includes(text(value.source, 20))
    ? text(value.source, 20) as PlaceSource
    : 'fireux'
  const placeType = text(value.place_type, 40) === 'non_physical'
    ? 'non_physical' as PlaceType
    : 'physical' as PlaceType
  const socialLinks = Object.fromEntries(
    Object.entries(record(value.social_links))
      .filter(([key]) => ['website', 'instagram', 'facebook', 'tiktok', 'linkedin', 'youtube'].includes(key))
      .map(([key, link]) => [key, url(link)] as const)
      .filter(([, link]) => Boolean(link))
  )

  return {
    id,
    name: text(value.name, 240),
    place_type: placeType,
    source,
    verified: value.verified === true,
    slug: text(value.slug, 240),
    short_name: text(value.short_name, 120),
    brand_tagline: text(value.brand_tagline, 240),
    about: text(value.about),
    formatted_address: text(value.formatted_address, 500),
    short_address: text(value.short_address, 240),
    search_term: text(value.search_term, 1_000),
    lat: coordinate(value.lat, -90, 90),
    lng: coordinate(value.lng, -180, 180),
    image_url: url(assets.image_url),
    cover_image: url(assets.cover_image),
    gallery_images: Array.from(new Set(
      assets.gallery_images.map(url).filter(Boolean)
    )).slice(0, 24),
    identity: {
      logo_image_url: url(assets.identity.logo_image_url),
      wordmark_image_url: url(assets.identity.wordmark_image_url),
    },
    media_backdrop_color: assets.media_backdrop_color,
    brand_palette: readBrandPalette(value.brand_palette),
    phone: text(value.phone, 120),
    email: text(value.email, 320),
    website: url(value.website),
    social_links: socialLinks,
    default_currency_code: normalizePlaceCurrencyCode(value.default_currency_code),
    timezone: normalizePlaceTimezone(value.timezone),
    business_hours: normalizePlaceBusinessHours(value.business_hours) || { windows: [] },
  }
}
