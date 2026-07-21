// Concurrent edit — 2026-07-20 21:54 CEST — Place-root authority pass: transactionally authorize and normalize sparse Place writes.
// Concurrent edit — 2026-07-21 15:07 CEST — Place provenance/privacy hardening: remove claim-derived privilege and require explicit App-admin or Kitchen-operator authority.
import { useRuntimeConfig } from '#imports'
import { FieldValue } from 'firebase-admin/firestore'
import { createError, type H3Event } from 'h3'
import { requireFirebaseBearerUser } from 'fireux-core/runtime/server/utils/auth/bearer.ts'
import { getRuntimeFirestore } from 'fireux-core/runtime/server/utils/getRuntimeFirestore.ts'
import {
  isFirestoreDocumentId,
  requireFirestoreDocumentId,
} from 'fireux-core/runtime/server/utils/ids/path.ts'
import { serverAuditStamp } from 'fireux-core/runtime/server/utils/records/stamps.ts'
import { PlaceStorage } from '../../models/place.model'
import { normalizePlaceBusinessHours } from '../../utils/place-spine'

type PlacePatchRequest = {
  app_id?: unknown
  kitchen_id?: unknown
  patch?: unknown
}

const text = (value: unknown) => String(value ?? '').trim()
const record = (value: unknown): Record<string, unknown> =>
  value && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {}
const ids = (value: unknown) =>
  Array.isArray(value) ? value.map(text).filter(Boolean) : []

const optionalTextFields = new Map<string, number>([
  ['short_name', 120],
  ['brand_tagline', 240],
  ['about', 10_000],
  ['formatted_address', 500],
  ['short_address', 240],
  ['search_term', 1_000],
  ['image_url', 2_048],
  ['cover_image', 2_048],
  ['phone', 120],
  ['email', 320],
  ['website', 2_048],
])
const allowedSocialKeys = new Set([
  'website',
  'instagram',
  'facebook',
  'tiktok',
  'linkedin',
  'youtube',
])
const allowedPatchKeys = new Set([
  'name',
  ...optionalTextFields.keys(),
  'lat',
  'lng',
  'image_shade',
  'gallery_images',
  'social_links',
  'default_currency_code',
  'timezone',
  'business_hours',
])

function badRequest(statusMessage: string): never {
  throw createError({ statusCode: 400, statusMessage })
}

function deleteOrText(value: unknown, maxLength: number) {
  const next = text(value)
  if (!next) return FieldValue.delete()
  if (next.length > maxLength) badRequest(`Value exceeds ${maxLength} characters.`)
  return next
}

function normalizedTimezone(value: unknown) {
  const timezone = text(value)
  if (!timezone) return FieldValue.delete()
  if (timezone.length > 80) badRequest('Timezone is too long.')
  try {
    new Intl.DateTimeFormat('en', { timeZone: timezone }).format()
  } catch {
    badRequest('Use a valid IANA timezone, such as Europe/Zurich.')
  }
  return timezone
}

function normalizedSocialLinks(value: unknown) {
  const source = record(value)
  const unknownKeys = Object.keys(source).filter(key => !allowedSocialKeys.has(key))
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

function normalizedGallery(value: unknown) {
  if (value === null || value === undefined) return FieldValue.delete()
  if (!Array.isArray(value)) badRequest('Gallery images must be a list.')

  const images = Array.from(new Set(value.map(text).filter(Boolean)))
  if (images.length > 24) badRequest('Gallery images are limited to 24 items.')
  if (images.some(image => image.length > 2_048)) {
    badRequest('A gallery image URL is too long.')
  }
  return images.length ? images : FieldValue.delete()
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

function normalizePatch(raw: unknown) {
  const source = record(raw)
  const keys = Object.keys(source)
  if (!keys.length) badRequest('Place patch is required.')
  if (keys.length > 24) badRequest('Place patch is too large.')

  const unsupported = keys.filter(key => !allowedPatchKeys.has(key))
  if (unsupported.length) badRequest(`Unsupported Place field: ${unsupported[0]}.`)

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
      patch[key] = deleteOrText(value, optionalTextFields.get(key) || 240)
      continue
    }
    if (key === 'lat' || key === 'lng') {
      patch[key] = normalizedNumber(key, value)
      continue
    }
    if (key === 'image_shade') {
      const shade = text(value).toLowerCase()
      patch.image_shade = shade === 'light' || shade === 'dark'
        ? shade
        : FieldValue.delete()
      continue
    }
    if (key === 'gallery_images') {
      patch.gallery_images = normalizedGallery(value)
      continue
    }
    if (key === 'social_links') {
      patch.social_links = normalizedSocialLinks(value)
      continue
    }
    if (key === 'default_currency_code') {
      const code = text(value).toUpperCase()
      if (code && !/^[A-Z]{3}$/.test(code)) {
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
      patch.business_hours = normalizePlaceBusinessHours(value) || FieldValue.delete()
      continue
    }
  }

  return patch
}

function readRootKitchenAppId(value: unknown) {
  const kitchen = record(value)
  const appScope = record(kitchen.app_scope)
  return text(appScope.app_id || kitchen.app_scope_app_id)
}

export async function mutatePlace(
  event: H3Event,
  placeId: string,
  input: PlacePatchRequest
) {
  const id = requireFirestoreDocumentId(placeId, 'Place id')

  const { uid } = await requireFirebaseBearerUser(event)
  const db = getRuntimeFirestore()
  const placeRef = db.collection(PlaceStorage.collection).doc(id)
  const requestedPatch = record(input.patch)
  const requestedAppId = text(input.app_id)
  const requestedKitchenId = text(input.kitchen_id)
  if (Boolean(requestedAppId) !== Boolean(requestedKitchenId)) {
    badRequest('Kitchen Place authority requires both App and Kitchen ids.')
  }
  const kitchenAuthority = requestedAppId && requestedKitchenId
    ? {
        appId: requireFirestoreDocumentId(requestedAppId, 'App id'),
        kitchenId: requireFirestoreDocumentId(requestedKitchenId, 'Kitchen id'),
      }
    : null
  const runtimeAppId = text(useRuntimeConfig(event).public?.fireux?.id)
  const runtimeMembershipRef = isFirestoreDocumentId(runtimeAppId)
    ? db.doc(`apps/${runtimeAppId}/users/${uid}`)
    : null
  const rootKitchenRef = kitchenAuthority
    ? db.doc(`kitchens/${kitchenAuthority.kitchenId}`)
    : null
  const scopedKitchenRef = kitchenAuthority
    ? db.doc(
        `apps/${kitchenAuthority.appId}/kitchens/${kitchenAuthority.kitchenId}`
      )
    : null

  await db.runTransaction(async transaction => {
    const placeSnapshot = await transaction.get(placeRef)
    const runtimeMembershipSnapshot = runtimeMembershipRef
      ? await transaction.get(runtimeMembershipRef)
      : null
    const rootKitchenSnapshot = rootKitchenRef
      ? await transaction.get(rootKitchenRef)
      : null
    const scopedKitchenSnapshot = scopedKitchenRef
      ? await transaction.get(scopedKitchenRef)
      : null

    if (!placeSnapshot.exists) {
      throw createError({ statusCode: 404, statusMessage: 'Place not found.' })
    }

    const place = placeSnapshot.data() || {}
    const runtimeAdmin = runtimeMembershipSnapshot?.data()?.role === 'admin'
    const rootKitchen = rootKitchenSnapshot?.data() || {}
    const scopedKitchen = scopedKitchenSnapshot?.data() || {}
    const kitchenAccess = Boolean(
      kitchenAuthority &&
      rootKitchenSnapshot?.exists &&
      scopedKitchenSnapshot?.exists &&
      text(rootKitchen.place_id) === id &&
      readRootKitchenAppId(rootKitchen) === kitchenAuthority.appId &&
      ids(scopedKitchen.operator_ids).includes(uid)
    )
    if (!runtimeAdmin && !kitchenAccess) {
      throw createError({
        statusCode: 403,
        statusMessage: 'App admin or linked Kitchen operator access is required.',
      })
    }

    const patch = normalizePatch(requestedPatch)
    const requestedBusinessHours = normalizePlaceBusinessHours(
      requestedPatch.business_hours
    )
    const timezoneWasPatched = Object.prototype.hasOwnProperty.call(
      requestedPatch,
      'timezone'
    )
    const effectiveTimezone = timezoneWasPatched
      ? text(requestedPatch.timezone)
      : text(place.timezone)
    if (requestedBusinessHours && !effectiveTimezone) {
      badRequest('Set the Place timezone before saving business hours.')
    }
    if (
      timezoneWasPatched &&
      !effectiveTimezone &&
      normalizePlaceBusinessHours(place.business_hours) &&
      !Object.prototype.hasOwnProperty.call(requestedPatch, 'business_hours')
    ) {
      patch.business_hours = FieldValue.delete()
    }

    transaction.update(placeRef, {
      ...patch,
      updated: serverAuditStamp({ by: uid, ...(runtimeAppId ? { appId: runtimeAppId } : {}) }),
    })
  })

  return { id, updated: true }
}
