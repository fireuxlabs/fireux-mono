import {
  PUBLIC_PLACE_PROJECTION_KEYS,
  type PublicPlaceDetailProjection,
  type PublicPlaceProjection,
} from '../models/place-public.model.ts'
import type { PlaceType } from '../models/place.model.ts'
import { isFirestoreDocumentId } from 'fireux-core/runtime/utils/firestoreDocumentId'
import { readBrandPalette } from 'fireux-core/runtime/utils/brand-palette'
import {
  normalizePlaceBusinessHours,
  normalizePlaceCurrencyCode,
  normalizePlaceTimezone,
  readMediaBackdropColor,
} from './place-spine'

const text = (value: unknown) => String(value ?? '').trim()
const boundedText = (value: unknown, maxLength: number) => {
  const candidate = text(value)
  return candidate && candidate.length <= maxLength ? candidate : ''
}
const record = (value: unknown): Record<string, unknown> =>
  value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {}
const httpsUrl = (value: unknown) => {
  const candidate = boundedText(value, 2_048)
  if (!candidate) return ''
  try {
    const url = new URL(candidate)
    return url.protocol === 'https:' && !url.username && !url.password
      ? url.toString()
      : ''
  } catch {
    return ''
  }
}
const coarseAddress = (value: unknown) => {
  const address = record(value)
  const countryCode = boundedText(address.country_code, 2).toUpperCase()
  const parts = Array.from(
    new Set(
      [
        boundedText(address.city, 120),
        boundedText(address.region, 120),
        /^[A-Z]{2}$/.test(countryCode) ? countryCode : '',
      ].filter(Boolean)
    )
  )
  const result = parts.join(', ')
  return result.length <= 240 ? result : ''
}

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
    image_shade:
      text(value.image_shade) === 'light'
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

export function projectPublicPlace(
  id: string,
  value: Record<string, unknown>
): PublicPlaceProjection | null {
  if (!isFirestoreDocumentId(id)) return null
  const name = boundedText(value.name, 240)
  const type = placeType(value.place_type)
  if (!name || !type) return null

  return normalizePublicPlaceProjection({
    id,
    name,
    place_type: type,
    short_name: boundedText(value.short_name, 120),
    brand_tagline: boundedText(value.brand_tagline, 240),
    short_address: coarseAddress(value.address),
    image_url: httpsUrl(value.image_url),
    media_backdrop_color: readMediaBackdropColor(
      value.media_backdrop_color,
      value.image_shade
    ),
    image_shade: value.image_shade,
    verified: value.verified === true,
    slug: (() => {
      const slug = boundedText(value.slug, 240).toLowerCase()
      return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) ? slug : ''
    })(),
  })
}

export function projectPublicPlaceDetail(
  id: string,
  value: Record<string, unknown>
): PublicPlaceDetailProjection | null {
  const place = projectPublicPlace(id, value)
  if (!place) return null

  const currency = normalizePlaceCurrencyCode(value.default_currency_code)
  const timezone = normalizePlaceTimezone(value.timezone)
  const brandPalette = readBrandPalette(value.brand_palette)
  const galleryImages = Array.isArray(value.gallery_images)
    ? Array.from(
        new Set(value.gallery_images.map(httpsUrl).filter(Boolean))
      ).slice(0, 24)
    : []
  const businessHours = normalizePlaceBusinessHours(value.business_hours)
  const googleMapsUrl = httpsUrl(value.google_maps_url)
  return {
    ...place,
    ...(currency ? { default_currency_code: currency } : {}),
    ...(timezone ? { timezone } : {}),
    ...(Object.keys(brandPalette).length
      ? { brand_palette: brandPalette }
      : {}),
    ...(boundedText(value.about, 10_000)
      ? { about: boundedText(value.about, 10_000) }
      : {}),
    cover_image: httpsUrl(value.cover_image),
    gallery_images: galleryImages,
    logo_image: httpsUrl(value.logo_image),
    wordmark_image: httpsUrl(value.wordmark_image),
    business_hours: businessHours || { windows: [] },
    website: httpsUrl(value.website),
    ...(googleMapsUrl ? { google_maps_url: googleMapsUrl } : {}),
  }
}
