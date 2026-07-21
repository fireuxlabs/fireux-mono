// Concurrent edit — 2026-07-21 16:25 CEST — Place onboarding enrichment: preview and atomically persist confirmed Place defaults.
import { useRuntimeConfig } from '#imports'
import { createError, type H3Event } from 'h3'
import { UserAppStorage } from 'fireux-core/runtime/models/core/user.model.ts'
import { requireFirebaseBearerUser } from 'fireux-core/runtime/server/utils/auth/bearer.ts'
import { getRuntimeFirestore } from 'fireux-core/runtime/server/utils/getRuntimeFirestore.ts'
import { requireFirestoreDocumentId } from 'fireux-core/runtime/server/utils/ids/path.ts'
import { serverAuditStamp } from 'fireux-core/runtime/server/utils/records/stamps.ts'
import type {
  PlaceOnboardingCompleteResult,
  PlaceOnboardingDefaults,
  PlaceOnboardingPreview,
} from '../../models/place-onboarding.model'
import { PlaceStorage } from '../../models/place.model'
import {
  normalizePlaceCurrencyCode,
  normalizePlaceTimezone,
  suggestPlaceCurrencyCode,
} from '../../utils/place-spine'
import { fetchVerifiedGooglePlacePayload } from './google-details'
import { resolvePlacesApiKey } from '../utils/places-api-key'

type PlaceOnboardingRequest = {
  id?: unknown
  default_currency_code?: unknown
  timezone?: unknown
  image_url?: unknown
}

type OnboardingContext = {
  uid: string
  runtimeAppId: string
  role: 'admin' | 'user'
  db: ReturnType<typeof getRuntimeFirestore>
  membershipRef: ReturnType<ReturnType<typeof getRuntimeFirestore>['doc']>
  placeRef: ReturnType<ReturnType<typeof getRuntimeFirestore>['doc']>
}

const text = (value: unknown) => String(value ?? '').trim()
const record = (value: unknown): Record<string, unknown> =>
  value && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {}

function badRequest(statusMessage: string): never {
  throw createError({ statusCode: 400, statusMessage })
}

function requestRecord(value: unknown) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    badRequest('Place onboarding request must be an object.')
  }
  return value as Record<string, unknown>
}

function requireMemberRole(exists: boolean, value: unknown): 'admin' | 'user' {
  const role = text(value)
  if (!exists || (role !== 'admin' && role !== 'user')) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Current App membership is required to onboard a Place.',
    })
  }
  return role
}

async function context(event: H3Event, idValue: unknown): Promise<OnboardingContext> {
  const { uid } = await requireFirebaseBearerUser(event)
  const runtimeAppId = requireFirestoreDocumentId(
    useRuntimeConfig(event).public?.fireux?.id,
    'Runtime App id'
  )
  const id = requireFirestoreDocumentId(idValue, 'Place id')
  const db = getRuntimeFirestore()
  const membershipRef = db.doc(
    `apps/${runtimeAppId}/${UserAppStorage.collection}/${uid}`
  )
  const placeRef = db.collection(PlaceStorage.collection).doc(id)
  const membership = await membershipRef.get()
  const role = requireMemberRole(membership.exists, membership.get('role'))
  return { uid, runtimeAppId, role, db, membershipRef, placeRef }
}

function createdByCurrentApp(
  place: Record<string, unknown>,
  uid: string,
  appId: string
) {
  const created = record(place.created)
  return text(created.by) === uid && text(created.app_id) === appId
}

function canConfigure(
  place: Record<string, unknown>,
  actor: Pick<OnboardingContext, 'uid' | 'runtimeAppId' | 'role'>
) {
  return actor.role === 'admin' ||
    createdByCurrentApp(place, actor.uid, actor.runtimeAppId)
}

function currentDefaults(value: Record<string, unknown>) {
  const defaults: Partial<PlaceOnboardingDefaults> = {}
  const currency = normalizePlaceCurrencyCode(value.default_currency_code)
  const timezone = normalizePlaceTimezone(value.timezone)
  if (currency) defaults.default_currency_code = currency
  if (timezone) defaults.timezone = timezone
  return defaults
}

function countryCode(value: Record<string, unknown>) {
  return text(record(value.address).country_code).toUpperCase()
}

function coordinates(value: Record<string, unknown>) {
  const lat = Number(value.lat)
  const lng = Number(value.lng)
  return Number.isFinite(lat) && Number.isFinite(lng) &&
    lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180 &&
    !(lat === 0 && lng === 0)
    ? { lat, lng }
    : null
}

async function resolveTimezone(
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

function suggestions(
  value: Record<string, unknown>,
  timezone: string
) {
  const result: Partial<PlaceOnboardingDefaults> = {}
  const currency = suggestPlaceCurrencyCode(countryCode(value))
  if (currency) result.default_currency_code = currency
  if (timezone) result.timezone = timezone
  return result
}

function httpsImage(value: unknown, placeId: string) {
  const candidate = text(value)
  if (!candidate) return ''
  if (candidate.length > 2_048) badRequest('Place logo URL is too long.')
  try {
    const url = new URL(candidate)
    const decodedPath = decodeURIComponent(url.pathname)
    const expectedSuffix = `/o/places/${placeId}/avatar`
    if (
      url.protocol !== 'https:' ||
      url.username ||
      url.password ||
      url.hostname !== 'firebasestorage.googleapis.com' ||
      !decodedPath.endsWith(expectedSuffix)
    ) {
      badRequest('Place logo must use its canonical FireUX Storage path.')
    }
    return url.toString()
  } catch (error) {
    if (error && typeof error === 'object' && 'statusCode' in error) throw error
    badRequest('Place logo URL is invalid.')
  }
}

function storedHttpsImage(value: unknown) {
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

function completeInput(value: unknown) {
  const source = requestRecord(value)
  const allowed = new Set([
    'id',
    'default_currency_code',
    'timezone',
    'image_url',
  ])
  const unsupported = Object.keys(source).find(key => !allowed.has(key))
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
  return {
    id,
    defaults: {
      default_currency_code: defaultCurrencyCode,
      timezone,
    },
    ...(imageUrl ? { imageUrl } : {}),
  }
}

export async function previewPlaceOnboarding(
  event: H3Event,
  input: unknown
): Promise<PlaceOnboardingPreview> {
  const body = requestRecord(input)
  const unsupported = Object.keys(body).find(key => key !== 'id')
  if (unsupported) {
    badRequest(`Place onboarding preview contains unsupported field: ${unsupported}.`)
  }
  const actor = await context(event, body.id)
  const snapshot = await actor.placeRef.get()

  if (snapshot.exists) {
    const place = snapshot.data() || {}
    const current = currentDefaults(place)
    const timezone = current.timezone || await resolveTimezone(event, place)
    const suggested = suggestions(place, timezone)
    const imageUrl = storedHttpsImage(place.image_url)
    return {
      id: actor.placeRef.id,
      existing: true,
      can_configure: canConfigure(place, actor),
      requires_defaults: !current.default_currency_code || !current.timezone,
      ...(Object.keys(current).length ? { current } : {}),
      ...(Object.keys(suggested).length ? { suggestions: suggested } : {}),
      ...(imageUrl ? { image_url: imageUrl } : {}),
    }
  }

  const provider = await fetchVerifiedGooglePlacePayload(
    event,
    actor.placeRef.id
  )
  const timezone = await resolveTimezone(event, provider)
  const suggested = suggestions(provider, timezone)
  return {
    id: actor.placeRef.id,
    existing: false,
    can_configure: true,
    requires_defaults: true,
    ...(Object.keys(suggested).length ? { suggestions: suggested } : {}),
  }
}

export async function completePlaceOnboarding(
  event: H3Event,
  input: PlaceOnboardingRequest
): Promise<PlaceOnboardingCompleteResult> {
  const requested = completeInput(input)
  const actor = await context(event, requested.id)
  const existing = await actor.placeRef.get()
  const provider = existing.exists
    ? null
    : await fetchVerifiedGooglePlacePayload(event, requested.id)

  return actor.db.runTransaction(async transaction => {
    const [membership, snapshot] = await Promise.all([
      transaction.get(actor.membershipRef),
      transaction.get(actor.placeRef),
    ])
    const role = requireMemberRole(membership.exists, membership.get('role'))

    if (!snapshot.exists) {
      if (!provider) {
        throw createError({
          statusCode: 409,
          statusMessage: 'Place changed during onboarding. Please try again.',
        })
      }
      transaction.create(actor.placeRef, {
        ...provider,
        ...requested.defaults,
        ...('imageUrl' in requested ? { image_url: requested.imageUrl } : {}),
        created: serverAuditStamp({
          by: actor.uid,
          appId: actor.runtimeAppId,
        }),
        updated: serverAuditStamp({ by: actor.uid }),
      })
      return {
        ok: true,
        id: requested.id,
        created: true,
        configured: true,
        defaults: requested.defaults,
        ...('imageUrl' in requested ? { image_url: requested.imageUrl } : {}),
      }
    }

    const place = snapshot.data() || {}
    const current = currentDefaults(place)
    const storedImage = storedHttpsImage(place.image_url)
    const patch: Record<string, unknown> = {}
    if (!current.default_currency_code) {
      patch.default_currency_code = requested.defaults.default_currency_code
    }
    if (!current.timezone) patch.timezone = requested.defaults.timezone
    if (!storedImage && 'imageUrl' in requested) {
      patch.image_url = requested.imageUrl
    }

    if (Object.keys(patch).length) {
      const authorized = role === 'admin' || createdByCurrentApp(
        place,
        actor.uid,
        actor.runtimeAppId
      )
      if (!authorized) {
        throw createError({
          statusCode: 403,
          statusMessage: 'This existing Place requires an App admin to finish its defaults.',
        })
      }
      transaction.update(actor.placeRef, {
        ...patch,
        updated: serverAuditStamp({
          by: actor.uid,
          appId: actor.runtimeAppId,
        }),
      })
    }

    return {
      ok: true,
      id: requested.id,
      created: false,
      configured: Boolean(Object.keys(patch).length),
      defaults: {
        default_currency_code:
          current.default_currency_code || requested.defaults.default_currency_code,
        timezone: current.timezone || requested.defaults.timezone,
      },
      ...(storedImage
        ? { image_url: storedImage }
        : 'imageUrl' in requested
          ? { image_url: requested.imageUrl }
          : {}),
    }
  })
}
