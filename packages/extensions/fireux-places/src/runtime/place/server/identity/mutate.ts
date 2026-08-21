// Concurrent edit — 2026-07-20 21:54 CEST — Place-root authority pass: transactionally authorize and normalize sparse Place writes.
// Concurrent edit — 2026-07-21 15:07 CEST — Place provenance/privacy hardening: remove claim-derived privilege and require explicit App-admin or Kitchen-operator authority.
// Concurrent edit — 2026-07-22 12:13 CEST — Place palette onboarding: validate brand colours at the trusted Place mutation boundary.
// Concurrent edit — 2026-07-28 — Entity-family audit: require the exact nested Kitchen App scope for Place operator authority.
import { useRuntimeConfig } from '#imports'
import { FieldValue } from 'firebase-admin/firestore'
import { createError, type H3Event } from 'h3'
import { requireFirebaseBearerUser } from 'fireux-core/runtime/server/utils/auth/bearer'
import { runGuardedServerTransaction } from 'fireux-core/runtime/server/utils/firestore-mutations/server-transaction'
import {
  isFirestoreDocumentId,
  requireFirestoreDocumentId,
} from 'fireux-core/runtime/server/utils/ids/path'
import { serverAuditStamp } from 'fireux-core/runtime/server/utils/records/stamps'
import {
  FIRESTORE_MUTATION_TARGETS,
  serverAppUsersTarget,
  serverKitchenTeamMembersTarget,
} from 'fireux-core/runtime/utils/firestore-mutations/targets'
import {
  requireFirebaseStorageDownloadUrl,
  runtimeStorageBucketName,
} from 'fireux-core/runtime/server/utils/uploads/storage'
import {
  normalizeHexColor,
  parseBrandPalette,
} from 'fireux-core/runtime/utils/brand-palette'
import { normalizePlaceBusinessHours } from '../../utils/place-spine'
import { readRootKitchenManagement } from './mutation-authority'
import {
  allowedPlacePatchKeys as allowedPatchKeys,
  allowedPlaceSocialKeys as allowedSocialKeys,
  optionalPlaceTextFields as optionalTextFields,
} from './mutation-fields'
import { readPlace } from './read'

type PlacePatchRequest = {
  app_id?: unknown
  kitchen_id?: unknown
  patch?: unknown
}

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
  try {
    new Intl.DateTimeFormat('en', { timeZone: timezone }).format()
  } catch {
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

function normalizePatch(
  raw: unknown,
  target: { bucketName: string; placeId: string }
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
        patch[key] = requireFirebaseStorageDownloadUrl(normalized, {
          bucketName: target.bucketName,
          objectPath:
            key === 'image_url'
              ? `places/${target.placeId}/image`
              : key === 'cover_image'
                ? `places/${target.placeId}/cover`
                : key === 'logo_image'
                  ? `places/${target.placeId}/logo`
                  : `places/${target.placeId}/wordmark`,
          label:
            key === 'image_url'
              ? 'Place image'
              : key === 'cover_image'
                ? 'Place cover'
                : key === 'logo_image'
                  ? 'Place logo'
                  : 'Place wordmark',
        })
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

  return patch
}

export async function mutatePlace(
  event: H3Event,
  placeId: string,
  input: PlacePatchRequest
) {
  const id = requireFirestoreDocumentId(placeId, 'Place id')

  const { uid } = await requireFirebaseBearerUser(event)
  const requestedPatch = record(input.patch)
  const requestedAppId = text(input.app_id)
  const requestedKitchenId = text(input.kitchen_id)
  if (Boolean(requestedAppId) !== Boolean(requestedKitchenId)) {
    badRequest('Kitchen Place authority requires both App and Kitchen ids.')
  }
  const kitchenAuthority =
    requestedAppId && requestedKitchenId
      ? {
          appId: requireFirestoreDocumentId(requestedAppId, 'App id'),
          kitchenId: requireFirestoreDocumentId(
            requestedKitchenId,
            'Kitchen id'
          ),
        }
      : null
  const runtimeAppId = text(useRuntimeConfig(event).public?.fireux?.id)
  const ecosystem = text(useRuntimeConfig(event).public?.fireux?.ecosystem)
  const storageBucket = runtimeStorageBucketName()
  if (
    kitchenAuthority &&
    (!isFirestoreDocumentId(runtimeAppId) ||
      kitchenAuthority.appId !== runtimeAppId)
  ) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Kitchen Place authority must belong to the current App.',
    })
  }
  const places = FIRESTORE_MUTATION_TARGETS.places
  const memberships = isFirestoreDocumentId(runtimeAppId)
    ? serverAppUsersTarget(runtimeAppId)
    : null
  const kitchens = FIRESTORE_MUTATION_TARGETS.kitchens
  const kitchenTeam = kitchenAuthority
    ? serverKitchenTeamMembersTarget(kitchenAuthority.kitchenId)
    : null

  await runGuardedServerTransaction(places.database, async (mutations) => {
    const [
      placeSnapshot,
      runtimeMembershipSnapshot,
      rootKitchenSnapshot,
      kitchenTeamMemberSnapshot,
    ] = await Promise.all([
      mutations.read<Record<string, unknown>>(places, id),
      memberships
        ? mutations.read<Record<string, unknown>>(memberships, uid)
        : Promise.resolve(null),
      kitchenAuthority
        ? mutations.read<Record<string, unknown>>(
            kitchens,
            kitchenAuthority.kitchenId
          )
        : Promise.resolve(null),
      kitchenAuthority && kitchenTeam
        ? mutations.read<Record<string, unknown>>(
            kitchenTeam,
            uid
          )
        : Promise.resolve(null),
    ])

    if (!placeSnapshot.exists) {
      throw createError({ statusCode: 404, statusMessage: 'Place not found.' })
    }

    const place = placeSnapshot.data || {}
    const runtimeAdmin = runtimeMembershipSnapshot?.data?.role === 'admin'
    const rootKitchen = rootKitchenSnapshot?.data || {}
    const rootKitchenManagement = readRootKitchenManagement(
      rootKitchen,
      ecosystem
    )
    const kitchenTeamMember = kitchenTeamMemberSnapshot?.data || {}
    const kitchenTeamRole = text(kitchenTeamMember.role)
    const kitchenAccess = Boolean(
      kitchenAuthority &&
        rootKitchenSnapshot?.exists &&
        kitchenTeamMemberSnapshot?.exists &&
        text(rootKitchen.place_id) === id &&
        rootKitchenManagement?.appId === kitchenAuthority.appId &&
        text(kitchenTeamMember.user_id) === uid &&
        text(kitchenTeamMember.status) === 'active' &&
        (kitchenTeamRole === 'owner' || kitchenTeamRole === 'operator')
    )
    if (!runtimeAdmin && !kitchenAccess) {
      throw createError({
        statusCode: 403,
        statusMessage:
          'App admin or linked Kitchen operator access is required.',
      })
    }

    const patch = normalizePatch(requestedPatch, {
      bucketName: storageBucket,
      placeId: id,
    })
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

    mutations.update(places, id, {
      ...patch,
      updated: serverAuditStamp({
        by: uid,
        ...(runtimeAppId ? { appId: runtimeAppId } : {}),
      }),
    })
  })

  const place = await readPlace(id)
  if (!place) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Updated Place is unavailable.',
    })
  }

  return { place }
}
