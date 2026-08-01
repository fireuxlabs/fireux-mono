import { createError, type H3Event } from 'h3'
import { serverAuditStamp } from 'fireux-core/runtime/server/utils/records/stamps.ts'
import type {
  PlaceOnboardingCompleteResult,
  PlaceOnboardingPreview,
} from '../../models/place-onboarding.model'
import {
  canConfigure,
  context,
  createdByCurrentApp,
  currentDefaults,
} from './onboarding-context'
import {
  badRequest,
  requestRecord,
  requireMemberRole,
  type PlaceOnboardingRequest,
} from './onboarding-input'
import {
  completeInput,
  resolveTimezone,
  storedBrandPalette,
  storedHttpsImage,
  suggestions,
} from './onboarding-values'
import { fetchVerifiedGooglePlacePayload } from './google-details'

export async function previewPlaceOnboarding(
  event: H3Event,
  input: unknown
): Promise<PlaceOnboardingPreview> {
  const body = requestRecord(input)
  const unsupported = Object.keys(body).find((key) => key !== 'id')
  if (unsupported) {
    badRequest(
      `Place onboarding preview contains unsupported field: ${unsupported}.`
    )
  }
  const actor = await context(event, body.id)
  const snapshot = await actor.placeRef.get()

  if (snapshot.exists) {
    const place = snapshot.data() || {}
    const current = currentDefaults(place)
    const timezone = current.timezone || (await resolveTimezone(event, place))
    const suggested = suggestions(place, timezone)
    const imageUrl = storedHttpsImage(place.image_url)
    const brandPalette = storedBrandPalette(place)
    return {
      id: actor.placeRef.id,
      existing: true,
      can_configure: canConfigure(place, actor),
      requires_defaults: !current.default_currency_code || !current.timezone,
      ...(Object.keys(current).length ? { current } : {}),
      ...(Object.keys(suggested).length ? { suggestions: suggested } : {}),
      ...(imageUrl ? { image_url: imageUrl } : {}),
      ...(Object.keys(brandPalette).length
        ? { brand_palette: brandPalette }
        : {}),
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

  return actor.db.runTransaction(async (transaction) => {
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
        ...('brandPalette' in requested
          ? { brand_palette: requested.brandPalette }
          : {}),
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
        ...('brandPalette' in requested
          ? { brand_palette: requested.brandPalette }
          : {}),
      }
    }

    const place = snapshot.data() || {}
    const current = currentDefaults(place)
    const storedImage = storedHttpsImage(place.image_url)
    const currentBrandPalette = storedBrandPalette(place)
    const patch: Record<string, unknown> = {}
    if (!current.default_currency_code) {
      patch.default_currency_code = requested.defaults.default_currency_code
    }
    if (!current.timezone) patch.timezone = requested.defaults.timezone
    if (!storedImage && 'imageUrl' in requested) {
      patch.image_url = requested.imageUrl
    }
    if (
      !Object.keys(currentBrandPalette).length &&
      'brandPalette' in requested
    ) {
      patch.brand_palette = requested.brandPalette
    }

    if (Object.keys(patch).length) {
      const authorized =
        role === 'admin' ||
        createdByCurrentApp(place, actor.uid, actor.runtimeAppId)
      if (!authorized) {
        throw createError({
          statusCode: 403,
          statusMessage:
            'This existing Place requires an App admin to finish its shared defaults and branding.',
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
          current.default_currency_code ||
          requested.defaults.default_currency_code,
        timezone: current.timezone || requested.defaults.timezone,
      },
      ...(storedImage
        ? { image_url: storedImage }
        : 'imageUrl' in requested
          ? { image_url: requested.imageUrl }
          : {}),
      ...(Object.keys(currentBrandPalette).length
        ? { brand_palette: currentBrandPalette }
        : 'brandPalette' in requested
          ? { brand_palette: requested.brandPalette }
          : {}),
    }
  })
}
