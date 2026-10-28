import { createError, type H3Event } from 'h3'
import { runGuardedServerTransaction } from 'fireux-core/runtime/server/utils/firestore-mutations/server-transaction'
import { serverAuditStamp } from 'fireux-core/runtime/server/utils/records/stamps'
import { PLACE_MUTATION_TARGETS } from '../../mutation-targets'
import { serverAppUsersTarget } from 'fireux-core/runtime/app/server/mutation-targets'
import type {
  PlaceOnboardingCompleteResult,
  PlaceOnboardingPreview,
} from '../../../models/place-onboarding.model.ts'
import {
  canConfigure,
  context,
  createdByCurrentApp,
  currentDefaults,
} from './context'
import {
  badRequest,
  requestRecord,
  requireMemberRole,
  type PlaceOnboardingRequest,
} from './input'
import {
  completeInput,
  resolveTimezone,
  storedBrandPalette,
  storedHttpsImage,
  suggestions,
} from './values'
import { fetchVerifiedGooglePlacePayload } from '../../integration/google/details'
import { isSameSite } from '../../integration/logo/candidates'

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
    const logoImage = storedHttpsImage(place.logo_image)
    const shortName = String(place.short_name || '')
      .trim()
      .slice(0, 80)
    const tagline = String(place.tagline || '')
      .trim()
      .slice(0, 180)
    const about = String(place.about || '')
      .trim()
      .slice(0, 900)
    const tags = Array.isArray(place.tags)
      ? place.tags.map((value) => String(value || '').trim()).filter(Boolean)
      : []
    const coverImage = storedHttpsImage(place.cover_image)
    const brandPalette = storedBrandPalette(place)
    return {
      id: actor.placeRef.id,
      existing: true,
      can_configure: canConfigure(place, actor),
      requires_defaults: !current.default_currency_code || !current.timezone,
      ...(Object.keys(current).length ? { current } : {}),
      ...(Object.keys(suggested).length ? { suggestions: suggested } : {}),
      ...(imageUrl ? { image_url: imageUrl } : {}),
      ...(logoImage ? { logo_image: logoImage } : {}),
      ...(shortName ? { short_name: shortName } : {}),
      ...(tagline ? { tagline } : {}),
      ...(about ? { about } : {}),
      ...(tags.length ? { tags } : {}),
      ...(coverImage ? { cover_image: coverImage } : {}),
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
  const sourcePlace = existing.exists ? existing.data() || {} : provider || {}
  const logoImage =
    'logoImage' in requested &&
    typeof requested.logoImage === 'string' &&
    typeof sourcePlace.website === 'string' &&
    isSameSite(sourcePlace.website, requested.logoImage)
      ? requested.logoImage
      : undefined

  if ('logoImage' in requested && !logoImage) {
    badRequest('Place logo must come from the confirmed Place website.')
  }

  const memberships = serverAppUsersTarget(actor.runtimeAppId)
  const places = PLACE_MUTATION_TARGETS.places

  return runGuardedServerTransaction(places.database, async (mutations) => {
    const [membership, snapshot] = await Promise.all([
      mutations.read<Record<string, unknown>>(memberships, actor.uid),
      mutations.read<Record<string, unknown>>(places, requested.id),
    ])
    const role = requireMemberRole(membership.exists, membership.data?.role)

    if (!snapshot.exists) {
      if (!provider) {
        throw createError({
          statusCode: 409,
          statusMessage: 'Place changed during onboarding. Please try again.',
        })
      }
      mutations.create(places, requested.id, {
        ...provider,
        ...requested.defaults,
        ...('imageUrl' in requested ? { image_url: requested.imageUrl } : {}),
        ...(logoImage ? { logo_image: logoImage } : {}),
        ...('shortName' in requested
          ? { short_name: requested.shortName }
          : {}),
        ...('tagline' in requested ? { tagline: requested.tagline } : {}),
        ...('about' in requested ? { about: requested.about } : {}),
        ...('tags' in requested ? { tags: requested.tags } : {}),
        ...('coverImage' in requested
          ? { cover_image: requested.coverImage }
          : {}),
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

    const place = snapshot.data || {}
    const current = currentDefaults(place)
    const storedImage = storedHttpsImage(place.image_url)
    const storedLogo = storedHttpsImage(place.logo_image)
    const currentBrandPalette = storedBrandPalette(place)
    const patch: Record<string, unknown> = {}
    if (!current.default_currency_code) {
      patch.default_currency_code = requested.defaults.default_currency_code
    }
    if (!current.timezone) patch.timezone = requested.defaults.timezone
    if (!storedImage && 'imageUrl' in requested) {
      patch.image_url = requested.imageUrl
    }
    if (!storedLogo && logoImage) patch.logo_image = logoImage
    if (!String(place.short_name || '').trim() && 'shortName' in requested) {
      patch.short_name = requested.shortName
    }
    if (!String(place.tagline || '').trim() && 'tagline' in requested) {
      patch.tagline = requested.tagline
    }
    if (!String(place.about || '').trim() && 'about' in requested) {
      patch.about = requested.about
    }
    if (
      (!Array.isArray(place.tags) || !place.tags.length) &&
      'tags' in requested
    ) {
      patch.tags = requested.tags
    }
    if (!storedHttpsImage(place.cover_image) && 'coverImage' in requested) {
      patch.cover_image = requested.coverImage
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
        role === 'dev' ||
        createdByCurrentApp(place, actor.uid, actor.runtimeAppId)
      if (!authorized) {
        throw createError({
          statusCode: 403,
          statusMessage:
            'This existing Place requires an App admin to finish its shared defaults and branding.',
        })
      }
      mutations.update(places, requested.id, {
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
