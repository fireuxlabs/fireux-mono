// Concurrent edit — 2026-07-21 14:08 CEST — Werkbox Firebase hardening: create Places only through a strict authenticated idempotent server boundary.
import { useRuntimeConfig } from '#imports'
import { createError, type H3Event } from 'h3'
import { requireFirebaseBearerUser } from 'fireux-core/runtime/server/utils/auth/bearer.ts'
import { getRuntimeFirestore } from 'fireux-core/runtime/server/utils/getRuntimeFirestore.ts'
import { requireFirestoreDocumentId } from 'fireux-core/runtime/server/utils/ids/path.ts'
import { serverAuditStamp } from 'fireux-core/runtime/server/utils/records/stamps.ts'
import { PlaceStorage } from '../../models/place.model'

type PlaceEnsureRequest = {
  id?: unknown
  place?: unknown
}

const placeKeys = new Set([
  'source',
  'name',
  'lat',
  'lng',
  'place_type',
  'search_term',
  'formatted_address',
  'short_address',
  'short_name',
  'brand_tagline',
  'about',
  'address',
  'timezone',
  'slug',
  'image_url',
  'cover_image',
  'gallery_images',
  'image_shade',
  'phone',
  'email',
  'website',
  'google_maps_url',
  'social_links',
  'types',
  'tags',
  'price_level',
  'default_currency_code',
  'business_hours',
  'claimed_by',
])
const addressKeys = new Set([
  'street',
  'city',
  'region',
  'postal_code',
  'country_code',
])
const socialKeys = new Set([
  'website',
  'instagram',
  'facebook',
  'tiktok',
  'linkedin',
  'youtube',
])
const businessDays = new Set([
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
])

function badRequest(statusMessage: string): never {
  throw createError({ statusCode: 400, statusMessage })
}

function record(value: unknown, label: string): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    badRequest(`${label} must be an object.`)
  }
  return value as Record<string, unknown>
}

function exactKeys(
  source: Record<string, unknown>,
  allowed: Set<string>,
  label: string
) {
  const unsupported = Object.keys(source).find(key => !allowed.has(key))
  if (unsupported) badRequest(`${label} contains unsupported field: ${unsupported}.`)
}

function boundedText(value: unknown, label: string, maxLength: number) {
  if (typeof value !== 'string') badRequest(`${label} must be text.`)
  const result = value.trim()
  if (!result) badRequest(`${label} is required.`)
  if (result.length > maxLength) {
    badRequest(`${label} exceeds ${maxLength} characters.`)
  }
  return result
}

function number(value: unknown, label: string, min: number, max: number) {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    badRequest(`${label} must be a number.`)
  }
  if (value < min || value > max) badRequest(`${label} is outside its valid range.`)
  return value
}

function httpsUrl(value: unknown, label: string) {
  const result = boundedText(value, label, 2_048)
  let url: URL
  try {
    url = new URL(result)
  } catch {
    badRequest(`${label} must be a valid HTTPS URL.`)
  }
  if (url.protocol !== 'https:' || url.username || url.password) {
    badRequest(`${label} must be a valid HTTPS URL.`)
  }
  return url.toString()
}

function stringList(
  value: unknown,
  label: string,
  maxItems: number,
  maxItemLength: number
) {
  if (!Array.isArray(value) || !value.length) {
    badRequest(`${label} must be a non-empty list.`)
  }
  if (value.length > maxItems) badRequest(`${label} has too many items.`)

  const items = value.map((item, index) =>
    boundedText(item, `${label}[${index}]`, maxItemLength)
  )
  const unique = Array.from(new Set(items))
  if (unique.length !== items.length) badRequest(`${label} contains duplicate items.`)
  return unique
}

function urlList(value: unknown, label: string, maxItems: number) {
  if (!Array.isArray(value) || !value.length) {
    badRequest(`${label} must be a non-empty list.`)
  }
  if (value.length > maxItems) badRequest(`${label} has too many items.`)
  const items = value.map((item, index) => httpsUrl(item, `${label}[${index}]`))
  if (new Set(items).size !== items.length) badRequest(`${label} contains duplicate items.`)
  return items
}

function address(value: unknown) {
  const source = record(value, 'Place address')
  exactKeys(source, addressKeys, 'Place address')
  if (!Object.keys(source).length) badRequest('Place address must not be empty.')

  const result: Record<string, string> = {}
  for (const [key, raw] of Object.entries(source)) {
    const maxLength = key === 'street' ? 240 : 120
    const normalized = boundedText(raw, `Place address ${key}`, maxLength)
    if (key === 'country_code') {
      const code = normalized.toUpperCase()
      if (!/^[A-Z]{2}$/.test(code)) {
        badRequest('Place address country_code must be a two-letter code.')
      }
      result[key] = code
    } else {
      result[key] = normalized
    }
  }
  return result
}

function socialLinks(value: unknown) {
  const source = record(value, 'Place social_links')
  exactKeys(source, socialKeys, 'Place social_links')
  if (!Object.keys(source).length) badRequest('Place social_links must not be empty.')
  return Object.fromEntries(
    Object.entries(source).map(([key, link]) => [
      key,
      httpsUrl(link, `Place social_links.${key}`),
    ])
  )
}

function clockTime(value: unknown, label: string) {
  const result = boundedText(value, label, 5)
  const match = result.match(/^(\d{2}):(\d{2})$/)
  const hour = Number(match?.[1])
  const minute = Number(match?.[2])
  if (!match || hour > 23 || minute > 59) {
    badRequest(`${label} must use 24-hour HH:MM format.`)
  }
  return result
}

function businessHours(value: unknown) {
  const source = record(value, 'Place business_hours')
  exactKeys(source, new Set(['windows']), 'Place business_hours')
  if (!Array.isArray(source.windows) || !source.windows.length) {
    badRequest('Place business_hours.windows must be a non-empty list.')
  }
  if (source.windows.length > 28) {
    badRequest('Place business_hours.windows is limited to 28 items.')
  }

  const windows = source.windows.map((rawWindow, index) => {
    const window = record(rawWindow, `Place business_hours.windows[${index}]`)
    exactKeys(
      window,
      new Set(['days', 'open', 'close']),
      `Place business_hours.windows[${index}]`
    )
    const days = stringList(
      window.days,
      `Place business_hours.windows[${index}].days`,
      7,
      9
    ).map(day => day.toLowerCase())
    if (days.some(day => !businessDays.has(day))) {
      badRequest(`Place business_hours.windows[${index}] contains an invalid day.`)
    }
    return {
      days,
      open: clockTime(window.open, `Place business_hours.windows[${index}].open`),
      close: clockTime(window.close, `Place business_hours.windows[${index}].close`),
    }
  })

  return { windows }
}

function timezone(value: unknown) {
  const result = boundedText(value, 'Place timezone', 80)
  try {
    new Intl.DateTimeFormat('en', { timeZone: result }).format()
  } catch {
    badRequest('Place timezone must be a valid IANA timezone.')
  }
  return result
}

function normalizePlace(value: unknown, uid: string) {
  const source = record(value, 'Place')
  exactKeys(source, placeKeys, 'Place')

  if (source.source !== 'fireux') badRequest('Place source must be fireux.')
  if (source.place_type !== 'physical') {
    badRequest('Place place_type must be physical.')
  }

  const name = boundedText(source.name, 'Place name', 240)
  const lat = number(source.lat, 'Place latitude', -90, 90)
  const lng = number(source.lng, 'Place longitude', -180, 180)
  if (lat === 0 && lng === 0) badRequest('Place coordinates must identify a real location.')

  const payload: Record<string, unknown> = {
    source: 'fireux',
    name,
    lat,
    lng,
    place_type: 'physical',
    search_term: boundedText(source.search_term, 'Place search_term', 1_000)
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, ''),
  }

  const textFields = new Map<string, number>([
    ['formatted_address', 500],
    ['short_address', 240],
    ['short_name', 120],
    ['brand_tagline', 240],
    ['about', 10_000],
    ['phone', 120],
    ['price_level', 40],
  ])
  for (const [key, maxLength] of textFields) {
    if (Object.prototype.hasOwnProperty.call(source, key)) {
      payload[key] = boundedText(source[key], `Place ${key}`, maxLength)
    }
  }

  for (const key of ['image_url', 'cover_image', 'website', 'google_maps_url']) {
    if (Object.prototype.hasOwnProperty.call(source, key)) {
      payload[key] = httpsUrl(source[key], `Place ${key}`)
    }
  }

  if (Object.prototype.hasOwnProperty.call(source, 'email')) {
    const email = boundedText(source.email, 'Place email', 320).toLowerCase()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      badRequest('Place email is invalid.')
    }
    payload.email = email
  }
  if (Object.prototype.hasOwnProperty.call(source, 'address')) {
    payload.address = address(source.address)
  }
  if (Object.prototype.hasOwnProperty.call(source, 'timezone')) {
    payload.timezone = timezone(source.timezone)
  }
  if (Object.prototype.hasOwnProperty.call(source, 'slug')) {
    const slug = boundedText(source.slug, 'Place slug', 240)
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
      badRequest('Place slug is invalid.')
    }
    payload.slug = slug
  }
  if (Object.prototype.hasOwnProperty.call(source, 'gallery_images')) {
    payload.gallery_images = urlList(source.gallery_images, 'Place gallery_images', 24)
  }
  if (Object.prototype.hasOwnProperty.call(source, 'image_shade')) {
    if (source.image_shade !== 'light' && source.image_shade !== 'dark') {
      badRequest('Place image_shade must be light or dark.')
    }
    payload.image_shade = source.image_shade
  }
  if (Object.prototype.hasOwnProperty.call(source, 'social_links')) {
    payload.social_links = socialLinks(source.social_links)
  }
  if (Object.prototype.hasOwnProperty.call(source, 'types')) {
    payload.types = stringList(source.types, 'Place types', 48, 120)
  }
  if (Object.prototype.hasOwnProperty.call(source, 'tags')) {
    payload.tags = stringList(source.tags, 'Place tags', 48, 120)
  }
  if (Object.prototype.hasOwnProperty.call(source, 'default_currency_code')) {
    const code = boundedText(
      source.default_currency_code,
      'Place default_currency_code',
      3
    ).toUpperCase()
    if (!/^[A-Z]{3}$/.test(code)) {
      badRequest('Place default_currency_code must be a three-letter code.')
    }
    payload.default_currency_code = code
  }
  if (Object.prototype.hasOwnProperty.call(source, 'business_hours')) {
    if (!payload.timezone) {
      badRequest('Place timezone is required with business_hours.')
    }
    payload.business_hours = businessHours(source.business_hours)
  }
  if (Object.prototype.hasOwnProperty.call(source, 'claimed_by')) {
    const claimedBy = boundedText(source.claimed_by, 'Place claimed_by', 128)
    if (claimedBy !== uid) {
      badRequest('A Place can only be claimed by the signed-in user.')
    }
    payload.claimed_by = uid
  }

  return payload
}

export async function ensurePlace(event: H3Event, input: PlaceEnsureRequest) {
  const { uid } = await requireFirebaseBearerUser(event)
  const body = record(input, 'Place ensure request')
  exactKeys(body, new Set(['id', 'place']), 'Place ensure request')
  const id = requireFirestoreDocumentId(body.id, 'Place id')
  const payload = normalizePlace(body.place, uid)
  const db = getRuntimeFirestore()
  const placeRef = db.collection(PlaceStorage.collection).doc(id)
  const runtimeAppId = String(useRuntimeConfig(event).public?.fireux?.id || '').trim()

  const created = await db.runTransaction(async transaction => {
    const snapshot = await transaction.get(placeRef)
    if (snapshot.exists) return false

    transaction.create(placeRef, {
      ...payload,
      created: serverAuditStamp({
        by: uid,
        ...(runtimeAppId ? { appId: runtimeAppId } : {}),
      }),
      updated: serverAuditStamp({ by: uid }),
    })
    return true
  })

  return { ok: true, id, created }
}
