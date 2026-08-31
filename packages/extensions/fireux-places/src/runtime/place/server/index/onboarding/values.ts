import { createError, type H3Event } from 'h3'
import { requireFirestoreDocumentId } from 'fireux-core/runtime/server/utils/ids/path'
import {
  requireFirebaseStorageDownloadUrl,
  runtimeStorageBucketName,
} from 'fireux-core/runtime/server/utils/uploads/storage'
import { parseBrandPalette } from 'fireux-core/runtime/utils/brand-palette'
import type { PlaceOnboardingDefaults } from '../../../models/place-onboarding.model.ts'
import {
  normalizePlaceCurrencyCode,
  normalizePlaceTimezone,
  suggestPlaceCurrencyCode,
} from '../../../utils/place-spine'
import { resolvePlacesApiKey } from '../../integration/google/places-api-key'
import { badRequest, record, requestRecord, text } from './input'

export function countryCode(value: Record<string, unknown>) {
  return text(record(value.address).country_code).toUpperCase()
}

export function coordinates(value: Record<string, unknown>) {
  const lat = Number(value.lat)
  const lng = Number(value.lng)
  return Number.isFinite(lat) &&
    Number.isFinite(lng) &&
    lat >= -90 &&
    lat <= 90 &&
    lng >= -180 &&
    lng <= 180 &&
    !(lat === 0 && lng === 0)
    ? { lat, lng }
    : null
}

export async function resolveTimezone(
  event: H3Event,
  value: Record<string, unknown>
) {
  const location = coordinates(value)
  const key = resolvePlacesApiKey(event)
  if (!location || !key) return ''

  const url = new URL('https://maps.googleapis.com/maps/api/timezone/json')
  url.searchParams.set('location', `${location.lat},${location.lng}`)
  url.searchParams.set('timestamp', String(Math.floor(Date.now() / 1_000)))
  url.searchParams.set('key', key)

  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(8_000) })
    const data = record(await response.json())
    return response.ok && text(data.status) === 'OK'
      ? normalizePlaceTimezone(data.timeZoneId)
      : ''
  } catch {
    return ''
  }
}

export function suggestions(value: Record<string, unknown>, timezone: string) {
  const result: Partial<PlaceOnboardingDefaults> = {}
  const currency = suggestPlaceCurrencyCode(countryCode(value))
  if (currency) result.default_currency_code = currency
  if (timezone) result.timezone = timezone
  return result
}

export function httpsImage(value: unknown, placeId: string) {
  const candidate = text(value)
  if (!candidate) return ''
  if (candidate.length > 2_048) badRequest('Place logo URL is too long.')
  return requireFirebaseStorageDownloadUrl(candidate, {
    bucketName: runtimeStorageBucketName(),
    objectPath: `places/${placeId}/avatar`,
    label: 'Place logo',
  })
}

export function httpsCoverImage(value: unknown, placeId: string) {
  const candidate = text(value)
  if (!candidate) return ''
  if (candidate.length > 2_048) badRequest('Place cover URL is too long.')
  return requireFirebaseStorageDownloadUrl(candidate, {
    bucketName: runtimeStorageBucketName(),
    objectPath: `places/${placeId}/cover`,
    label: 'Place cover',
  })
}

export function storedHttpsImage(value: unknown) {
  const candidate = text(value)
  if (!candidate || candidate.length > 2_048) return ''
  try {
    const url = new URL(candidate)
    return url.protocol === 'https:' && !url.username && !url.password
      ? url.toString()
      : ''
  } catch {
    return ''
  }
}

export function publicHttpsImage(value: unknown) {
  const candidate = text(value)
  if (!candidate || candidate.length > 2_048) return ''
  try {
    const url = new URL(candidate)
    return url.protocol === 'https:' && !url.username && !url.password
      ? url.toString()
      : ''
  } catch {
    return ''
  }
}

function boundedIdentityText(value: unknown, maxLength: number) {
  const candidate = text(value).replace(/\s+/g, ' ')
  return candidate && candidate.length <= maxLength ? candidate : ''
}

export function storedBrandPalette(value: Record<string, unknown>) {
  const result = parseBrandPalette(value.brand_palette)
  if (!result.ok) {
    throw createError({
      statusCode: 409,
      statusMessage: 'The stored Place brand palette needs repair.',
    })
  }
  return result.value
}

export function completeInput(value: unknown) {
  const source = requestRecord(value)
  const allowed = new Set([
    'id',
    'default_currency_code',
    'timezone',
    'image_url',
    'logo_image',
    'short_name',
    'tagline',
    'about',
    'tags',
    'cover_image',
    'brand_palette',
  ])
  const unsupported = Object.keys(source).find((key) => !allowed.has(key))
  if (unsupported) {
    badRequest(`Place onboarding contains unsupported field: ${unsupported}.`)
  }
  const id = requireFirestoreDocumentId(source.id, 'Place id')
  const defaultCurrencyCode = normalizePlaceCurrencyCode(
    source.default_currency_code
  )
  if (!defaultCurrencyCode) {
    badRequest('Confirm a valid 3-letter currency code.')
  }
  const timezone = normalizePlaceTimezone(source.timezone)
  if (!timezone) {
    badRequest('Confirm a valid IANA timezone, such as Europe/Zurich.')
  }
  const imageUrl = httpsImage(source.image_url, id)
  const logoImage = publicHttpsImage(source.logo_image)
  const shortName = boundedIdentityText(source.short_name, 80)
  const tagline = boundedIdentityText(source.tagline, 180)
  const about = boundedIdentityText(source.about, 900)
  const tags = Array.isArray(source.tags)
    ? Array.from(
        new Set(
          source.tags
            .map((value) => boundedIdentityText(value, 48).toLowerCase())
            .filter(Boolean)
        )
      ).slice(0, 8)
    : []
  const coverImage = httpsCoverImage(source.cover_image, id)
  const brandPaletteResult = parseBrandPalette(source.brand_palette)
  if (!brandPaletteResult.ok) badRequest(brandPaletteResult.error)
  const brandPalette = brandPaletteResult.value
  return {
    id,
    defaults: {
      default_currency_code: defaultCurrencyCode,
      timezone,
    },
    ...(imageUrl ? { imageUrl } : {}),
    ...(logoImage ? { logoImage } : {}),
    ...(shortName ? { shortName } : {}),
    ...(tagline ? { tagline } : {}),
    ...(about ? { about } : {}),
    ...(tags.length ? { tags } : {}),
    ...(coverImage ? { coverImage } : {}),
    ...(Object.keys(brandPalette).length ? { brandPalette } : {}),
  }
}
