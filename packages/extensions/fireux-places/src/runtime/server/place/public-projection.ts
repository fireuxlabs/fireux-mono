// Concurrent edit — 2026-07-21 14:28 CEST — Place public projection: allowlist sparse public location truth and exclude raw stamps/search metadata.
// Concurrent edit — 2026-07-21 15:05 CEST — Place provenance/privacy hardening: expose every canonical Place only through a coarse card-safe reference DTO.
// Concurrent edit — 2026-07-21 16:35 CEST — Place onboarding completion: add locale defaults only to the bounded detail projection.
// Concurrent edit — 2026-07-22 12:13 CEST — Place palette onboarding: project only validated sparse brand colours.
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
  readPlaceAssets,
} from '../../utils/place-spine'
import { normalizePublicPlaceProjection } from '../../utils/public-place-projection'

const placeTypes = new Set<PlaceType>(['physical', 'non_physical'])

const text = (value: unknown, maxLength: number) =>
  typeof value === 'string' && value.trim() && value.trim().length <= maxLength
    ? value.trim()
    : ''

const record = (value: unknown): Record<string, unknown> =>
  value && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown>
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

/** Build locality-only display copy without transporting street/postal truth. */
const coarseAddress = (value: unknown) => {
  const address = record(value)
  const countryCode = text(address.country_code, 2).toUpperCase()
  const parts = Array.from(new Set([
    text(address.city, 120),
    text(address.region, 120),
    /^[A-Z]{2}$/.test(countryCode) ? countryCode : '',
  ].filter(Boolean)))
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
  if (!name || !placeTypes.has(placeType)) return null
  const assets = readPlaceAssets(value)

  const result = normalizePublicPlaceProjection({
    id,
    name,
    place_type: placeType,
    short_name: text(value.short_name, 120),
    brand_tagline: text(value.brand_tagline, 240),
    short_address:
      text(value.short_address, 240) || coarseAddress(value.address),
    image_url: httpsUrl(assets.image_url),
    media_backdrop_color: assets.media_backdrop_color,
    image_shade: text(value.image_shade, 10) === 'light'
      ? 'light'
      : text(value.image_shade, 10) === 'dark'
        ? 'dark'
        : 'none',
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
  const about = text(value.about, 10_000)
  const assets = readPlaceAssets(value)
  const coverImage = httpsUrl(assets.cover_image)
  const galleryImages = Array.from(new Set(
    assets.gallery_images.map(httpsUrl).filter(Boolean)
  )).slice(0, 24)
  const identity = {
    logo_image_url: httpsUrl(assets.identity.logo_image_url),
    wordmark_image_url: httpsUrl(assets.identity.wordmark_image_url),
  }
  const businessHours = normalizePlaceBusinessHours(value.business_hours)
  const website = httpsUrl(value.website)
  const googleMapsUrl = httpsUrl(value.google_maps_url)
  const socialLinks = Object.fromEntries(
    Object.entries(record(value.social_links))
      .filter(([key]) => ['instagram', 'facebook', 'tiktok', 'linkedin', 'youtube'].includes(key))
      .map(([key, link]) => [key, httpsUrl(link)] as const)
      .filter(([, link]) => Boolean(link))
  )
  return {
    ...place,
    ...(currency ? { default_currency_code: currency } : {}),
    ...(timezone ? { timezone } : {}),
    ...(Object.keys(brandPalette).length
      ? { brand_palette: brandPalette }
      : {}),
    ...(about ? { about } : {}),
    ...(coverImage ? { cover_image: coverImage } : {}),
    ...(galleryImages.length ? { gallery_images: galleryImages } : {}),
    ...(identity.logo_image_url || identity.wordmark_image_url
      ? { identity: Object.fromEntries(Object.entries(identity).filter(([, url]) => Boolean(url))) }
      : {}),
    ...(businessHours ? { business_hours: businessHours } : {}),
    ...(website ? { website } : {}),
    ...(googleMapsUrl ? { google_maps_url: googleMapsUrl } : {}),
    ...(Object.keys(socialLinks).length ? { social_links: socialLinks } : {}),
  }
}
