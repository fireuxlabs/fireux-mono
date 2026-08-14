import { isFirestoreDocumentId } from 'fireux-core/runtime/server/utils/ids/path'
import { readBrandPalette } from 'fireux-core/runtime/utils/brand-palette'
import type { PlaceType } from '../../models/place.model'
import type {
  PublicPlaceDetailProjection,
  PublicPlaceProjection,
} from '../../models/place-public.model'
import {
  normalizePlaceBusinessHours,
  normalizePlaceCurrencyCode,
  normalizePlaceTimezone,
  readMediaBackdropColor,
} from '../../utils/place-spine'
import { normalizePublicPlaceProjection } from '../../utils/public-place-projection'

const text = (value: unknown, maxLength: number) =>
  typeof value === 'string' && value.trim() && value.trim().length <= maxLength
    ? value.trim()
    : ''

const record = (value: unknown): Record<string, unknown> =>
  value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {}

const httpsUrl = (value: unknown) => {
  const candidate = text(value, 2_048)
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
  const countryCode = text(address.country_code, 2).toUpperCase()
  const parts = Array.from(
    new Set(
      [
        text(address.city, 120),
        text(address.region, 120),
        /^[A-Z]{2}$/.test(countryCode) ? countryCode : '',
      ].filter(Boolean)
    )
  )
  const result = parts.join(', ')
  return result.length <= 240 ? result : ''
}

export function projectPublicPlace(
  id: string,
  value: Record<string, unknown>
): PublicPlaceProjection | null {
  if (!isFirestoreDocumentId(id)) return null
  const name = text(value.name, 240)
  const placeType = text(value.place_type, 40) as PlaceType
  if (!name || !['physical', 'non_physical'].includes(placeType)) return null

  const result = normalizePublicPlaceProjection({
    id,
    name,
    place_type: placeType,
    short_name: text(value.short_name, 120),
    brand_tagline: text(value.brand_tagline, 240),
    short_address: coarseAddress(value.address),
    image_url: httpsUrl(value.image_url),
    media_backdrop_color: readMediaBackdropColor(
      value.media_backdrop_color,
      value.image_shade
    ),
    image_shade: value.image_shade,
    verified: value.verified === true,
    slug: (() => {
      const slug = text(value.slug, 240).toLowerCase()
      return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) ? slug : ''
    })(),
  })

  return result
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
  const coverImage = httpsUrl(value.cover_image)
  const galleryImages = Array.isArray(value.gallery_images)
    ? Array.from(
        new Set(value.gallery_images.map(httpsUrl).filter(Boolean))
      ).slice(0, 24)
    : []
  const logoImage = httpsUrl(value.logo_image)
  const wordmarkImage = httpsUrl(value.wordmark_image)
  const businessHours = normalizePlaceBusinessHours(value.business_hours)
  const website = httpsUrl(value.website)
  const googleMapsUrl = httpsUrl(value.google_maps_url)
  return {
    ...place,
    ...(currency ? { default_currency_code: currency } : {}),
    ...(timezone ? { timezone } : {}),
    ...(Object.keys(brandPalette).length
      ? { brand_palette: brandPalette }
      : {}),
    ...(text(value.about, 10_000) ? { about: text(value.about, 10_000) } : {}),
    cover_image: coverImage,
    gallery_images: galleryImages,
    logo_image: logoImage,
    wordmark_image: wordmarkImage,
    business_hours: businessHours || { windows: [] },
    website,
    ...(googleMapsUrl ? { google_maps_url: googleMapsUrl } : {}),
  }
}
