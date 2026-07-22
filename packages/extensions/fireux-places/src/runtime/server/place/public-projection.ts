// Concurrent edit — 2026-07-21 14:28 CEST — Place public projection: allowlist sparse public location truth and exclude raw stamps/search metadata.
// Concurrent edit — 2026-07-21 15:05 CEST — Place provenance/privacy hardening: expose every canonical Place only through a coarse card-safe reference DTO.
// Concurrent edit — 2026-07-21 16:35 CEST — Place onboarding completion: add locale defaults only to the bounded detail projection.
// Concurrent edit — 2026-07-22 12:13 CEST — Place palette onboarding: project only validated sparse brand colours.
import { isFirestoreDocumentId } from 'fireux-core/runtime/server/utils/ids/path.ts'
import { readBrandPalette } from 'fireux-core/runtime/utils/brand-palette.ts'
import type {
  PlaceImageShade,
  PlaceType,
} from '../../models/place.model'
import type {
  PublicPlaceDetailProjection,
  PublicPlaceProjection,
} from '../../models/place-public.model'
import {
  normalizePlaceCurrencyCode,
  normalizePlaceTimezone,
} from '../../utils/place-spine'

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

  const result: PublicPlaceProjection = {
    id,
    name,
    place_type: placeType,
  }

  const shortName = text(value.short_name, 120)
  if (shortName) result.short_name = shortName

  const brandTagline = text(value.brand_tagline, 240)
  if (brandTagline) result.brand_tagline = brandTagline

  const shortAddress = coarseAddress(value.address)
  if (shortAddress) result.short_address = shortAddress

  const imageUrl = httpsUrl(value.image_url)
  if (imageUrl) result.image_url = imageUrl

  const imageShade = text(value.image_shade, 10) as PlaceImageShade
  if (imageShade === 'light' || imageShade === 'dark') {
    result.image_shade = imageShade
  }

  if (value.verified === true) result.verified = true

  const slug = text(value.slug, 240).toLowerCase()
  if (/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) result.slug = slug

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
  return {
    ...place,
    ...(currency ? { default_currency_code: currency } : {}),
    ...(timezone ? { timezone } : {}),
    ...(Object.keys(brandPalette).length
      ? { brand_palette: brandPalette }
      : {}),
  }
}
