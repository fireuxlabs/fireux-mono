import { FieldValue } from 'firebase-admin/firestore'
import { createError } from 'h3'
import { requireFirebaseStorageDownloadUrl } from 'fireux-core/runtime/server/utils/uploads/storage'
import {
  normalizeHexColor,
  parseBrandPalette,
} from 'fireux-core/runtime/utils/brand-palette'
import {
  normalizePlaceBusinessHours,
  normalizePlaceCurrencyCode,
  normalizePlaceTimezone,
} from '../../utils/place-spine'
import {
  allowedPlacePatchKeys as allowedPatchKeys,
  allowedPlaceSocialKeys as allowedSocialKeys,
  optionalPlaceTextFields as optionalTextFields,
} from './mutation-fields'

const text = (value: unknown) => String(value ?? '').trim()
const record = (value: unknown): Record<string, unknown> =>
  value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {}

function badRequest(statusMessage: string): never {
  throw createError({ statusCode: 400, statusMessage })
}

function deleteOrText(value: unknown, maxLength: number) {
  const next = text(value)
  if (!next) return FieldValue.delete()
  if (next.length > maxLength)
    badRequest(`Value exceeds ${maxLength} characters.`)
  return next
}

function normalizedTimezone(value: unknown) {
  const timezone = text(value)
  if (!timezone) return FieldValue.delete()
  if (timezone.length > 80) badRequest('Timezone is too long.')
  if (!normalizePlaceTimezone(timezone)) {
    badRequest('Use a valid IANA timezone, such as Europe/Zurich.')
  }
  return timezone
}

function normalizedSocialLinks(value: unknown) {
  const source = record(value)
  const unknownKeys = Object.keys(source).filter(
    (key) => !allowedSocialKeys.has(key)
  )
  if (unknownKeys.length) badRequest('Social links contain unsupported fields.')

  const links = Object.fromEntries(
    Object.entries(source)
      .map(([key, link]) => [key, text(link)] as const)
      .filter(([, link]) => Boolean(link))
      .map(([key, link]) => {
        if (link.length > 2_048) badRequest(`${key} link is too long.`)
        return [key, link] as const
      })
  )

  return Object.keys(links).length ? links : FieldValue.delete()
}

function normalizedGallery(
  value: unknown,
  target: { bucketName: string; placeId: string }
) {
  if (value === null || value === undefined) return FieldValue.delete()
  if (!Array.isArray(value)) badRequest('Gallery images must be a list.')

  const images = Array.from(new Set(value.map(text).filter(Boolean)))
  if (images.length > 24) badRequest('Gallery images are limited to 24 items.')
  if (images.some((image) => image.length > 2_048)) {
    badRequest('A gallery image URL is too long.')
  }
  return images.length
    ? images.map((image) =>
        requireFirebaseStorageDownloadUrl(image, {
          bucketName: target.bucketName,
          objectPrefix: `places/${target.placeId}/gallery/`,
          label: 'Place gallery image',
        })
      )
    : FieldValue.delete()
}

function normalizedNumber(key: 'lat' | 'lng', value: unknown) {
  if (value === null || value === undefined || text(value) === '') {
    return FieldValue.delete()
  }
  const number = typeof value === 'number' ? value : Number(value)
  const min = key === 'lat' ? -90 : -180
  const max = key === 'lat' ? 90 : 180
  if (!Number.isFinite(number) || number < min || number > max) {
    badRequest(`${key === 'lat' ? 'Latitude' : 'Longitude'} is invalid.`)
  }
  return number
}

export function normalizePlacePatch(
  raw: unknown,
  target: { bucketName: string; placeId: string },
  place: Record<string, unknown>
) {
  const source = record(raw)
  const keys = Object.keys(source)
  if (!keys.length) badRequest('Place patch is required.')
  if (keys.length > 24) badRequest('Place patch is too large.')

  const unsupported = keys.filter((key) => !allowedPatchKeys.has(key))
  if (unsupported.length)
    badRequest(`Unsupported Place field: ${unsupported[0]}.`)

  const patch: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(source)) {
    if (key === 'name') {
      const name = text(value)
      if (!name) badRequest('Place name is required.')
      if (name.length > 240) badRequest('Place name is too long.')
      patch.name = name
      continue
    }
    if (optionalTextFields.has(key)) {
      const normalized = deleteOrText(value, optionalTextFields.get(key) || 240)
      if (
        (key === 'image_url' ||
          key === 'cover_image' ||
          key === 'logo_image' ||
          key === 'wordmark_image') &&
        typeof normalized === 'string'
      ) {
        const objectPath = `places/${target.placeId}/${key === 'image_url' ? 'image' : key === 'cover_image' ? 'cover' : key === 'logo_image' ? 'logo' : 'wordmark'}`
        const mediaTarget = {
          bucketName: target.bucketName,
          label: 'Place image',
        }
        try {
          patch[key] = requireFirebaseStorageDownloadUrl(normalized, {
            ...mediaTarget,
            objectPath,
          })
        } catch {
          patch[key] = requireFirebaseStorageDownloadUrl(normalized, {
            ...mediaTarget,
            objectPrefix: `${objectPath}/revisions/`,
          })
        }
      } else {
        patch[key] = normalized
      }
      continue
    }
    if (key === 'lat' || key === 'lng') {
      patch[key] = normalizedNumber(key, value)
      continue
    }
    if (key === 'media_backdrop_color') {
      const color = normalizeHexColor(value)
      if (color === null) {
        badRequest('Media backdrop must be a 6-digit hex colour.')
      }
      patch.media_backdrop_color = color || FieldValue.delete()
      continue
    }
    if (key === 'gallery_images') {
      patch.gallery_images = normalizedGallery(value, target)
      continue
    }
    if (key === 'social_links') {
      patch.social_links = normalizedSocialLinks(value)
      continue
    }
    if (key === 'default_currency_code') {
      const code = normalizePlaceCurrencyCode(value)
      if (text(value) && !code) {
        badRequest('Currency must be a 3-letter ISO code.')
      }
      patch.default_currency_code = code || FieldValue.delete()
      continue
    }
    if (key === 'timezone') {
      patch.timezone = normalizedTimezone(value)
      continue
    }
    if (key === 'business_hours') {
      patch.business_hours =
        normalizePlaceBusinessHours(value) || FieldValue.delete()
      continue
    }
    if (key === 'brand_palette') {
      const result = parseBrandPalette(value)
      if (!result.ok) badRequest(result.error)
      patch.brand_palette = Object.keys(result.value).length
        ? result.value
        : FieldValue.delete()
      continue
    }
  }

  const requestedBusinessHours = normalizePlaceBusinessHours(
    source.business_hours
  )
  const timezoneWasPatched = Object.prototype.hasOwnProperty.call(
    source,
    'timezone'
  )
  const effectiveTimezone = timezoneWasPatched
    ? text(source.timezone)
    : text(place.timezone)
  if (requestedBusinessHours && !effectiveTimezone) {
    badRequest('Set the Place timezone before saving business hours.')
  }
  if (
    timezoneWasPatched &&
    !effectiveTimezone &&
    normalizePlaceBusinessHours(place.business_hours) &&
    !Object.prototype.hasOwnProperty.call(source, 'business_hours')
  ) {
    patch.business_hours = FieldValue.delete()
  }

  return patch
}
