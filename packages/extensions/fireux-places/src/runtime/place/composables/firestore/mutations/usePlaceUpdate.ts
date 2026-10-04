// FILE: packages/extensions/fireux-places/src/runtime/place/composables/firestore/mutations/usePlaceUpdate.ts
// Concurrent edit — 2026-07-20 21:57 CEST — Place-root authority pass: route sparse Place configuration through the trusted owner/operator boundary.
// Concurrent edit — 2026-07-21 15:05 CEST — Place provenance/privacy hardening: exclude claims from browser patch types and fail closed at legacy claim entrypoints.

import { useRoute } from '#imports'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import { useUserSession } from 'fireux-core/runtime/user/composables/session/useUserSession'
import { useCommandScope } from 'fireux-core/runtime/composables/fireux/commands/useCommandScope'
import { useRequireUser } from 'fireux-core/runtime/composables/fireux/firebase/useRequireUser'
import { toValue, type MaybeRefOrGetter } from 'vue'
import type {
  Place,
  PlaceBusinessHours,
  PlaceSocialLinks,
} from '../../../models/place.model.ts'
import type { PlaceDetailResponse } from '../../../models/place-read.model.ts'
import { usePlaceDetailState } from '../../usePlaceDetailState'
import { normalizePlaceBusinessHours } from '../../../utils/place-spine'
import { normalizeHexColor } from 'fireux-core/runtime/utils/brand-palette'

import type { PlaceIdentityDraft } from '../../../models/identity-edit'

type UpdateCtx = { id: string | null | undefined }
type PlaceBrowserPatch = Partial<
  Record<Exclude<keyof Place, 'claimed_by' | 'id'>, unknown>
> & { search_term?: unknown; brand_palette?: unknown }

export type PlaceMutationAuthority = {
  appId?: string | null | undefined
  kitchenId?: string | null | undefined
}

export type UsePlaceUpdateOptions = {
  authority?: MaybeRefOrGetter<PlaceMutationAuthority | null | undefined>
}

function reqId(ctx: UpdateCtx): string {
  const id = String(ctx?.id ?? '').trim()
  if (!id) throw new Error('Place id is required')
  return id
}

function sanitize(value: unknown): string {
  return typeof value === 'string' ? value.trim() : ''
}

function optionalString(value: unknown): string | null {
  return sanitize(value) || null
}

function toOptionalNumber(value: unknown): number | null {
  if (
    value === null ||
    value === undefined ||
    (typeof value === 'string' && value.trim() === '')
  ) {
    return null
  }
  const number =
    typeof value === 'number' ? value : Number(String(value ?? '').trim())
  if (!Number.isFinite(number)) throw new Error('Value must be a number')
  return number
}

function resolvedAuthority(options: UsePlaceUpdateOptions) {
  const authority = options.authority ? toValue(options.authority) : null
  const appId = sanitize(authority?.appId)
  const kitchenId = sanitize(authority?.kitchenId)

  return appId && kitchenId ? { app_id: appId, kitchen_id: kitchenId } : {}
}

/**
 * Central Place updates. The browser sends intent only; the server validates
 * owner, App-admin, or explicitly linked Kitchen-operator authority.
 */
export function usePlaceUpdate(options: UsePlaceUpdateOptions = {}) {
  const { publish } = usePlaceDetailState()
  const { currentUser } = useAuth(), config = useFireUXConfig(), route = useRoute()
  const { appUser, appPending, appError, appOutcome } = useUserSession()
  const captureIntent = useCommandScope([() => currentUser.value?.uid, () => config.appId, appUser, appPending, appError, appOutcome, () => route.fullPath, () => JSON.stringify(resolvedAuthority(options))])
  const update = async (id: string, patch: PlaceBrowserPatch) => {
    const body = JSON.parse(JSON.stringify({ patch, ...resolvedAuthority(options) }))
    const uid = currentUser.value?.uid, isCurrent = captureIntent()
    const assertCurrent = () => { if (!uid || !isCurrent()) throw new Error('The account, App, Place or page changed. Reopen Place editing.') }
    assertCurrent()
    const user = await useRequireUser()
    assertCurrent()
    if (user.uid !== uid) throw new Error('The account changed. Reopen Place editing.')
    const token = await user.getIdToken()
    assertCurrent()
    const response = await $fetch<PlaceDetailResponse>(`/api/places/${encodeURIComponent(id)}`, { method: 'PATCH', headers: { Authorization: `Bearer ${token}` }, body })
    if (response?.place?.id !== id) throw new Error('Place response did not match the requested Place.')
    if (isCurrent()) publish(response)
    return response.place
  }

  async function updateName(value: string, ctx: UpdateCtx) {
    const name = sanitize(value)
    if (!name) throw new Error('Place name is required')
    await update(reqId(ctx), { name })
  }

  async function updateShortName(value: string, ctx: UpdateCtx) {
    await update(reqId(ctx), { short_name: optionalString(value) })
  }

  async function updateFormattedAddress(value: string, ctx: UpdateCtx) {
    await update(reqId(ctx), { formatted_address: optionalString(value) })
  }

  async function updateShortAddress(value: string, ctx: UpdateCtx) {
    await update(reqId(ctx), { short_address: optionalString(value) })
  }

  async function updateSearchTerm(value: string, ctx: UpdateCtx) {
    await update(reqId(ctx), {
      search_term: optionalString(sanitize(value).toLowerCase()),
    })
  }

  async function updateLat(value: string | number, ctx: UpdateCtx) {
    await update(reqId(ctx), { lat: toOptionalNumber(value) })
  }

  async function updateLng(value: string | number, ctx: UpdateCtx) {
    await update(reqId(ctx), { lng: toOptionalNumber(value) })
  }

  async function updatePlaceImage(value: string, ctx: UpdateCtx) {
    await update(reqId(ctx), { image_url: optionalString(value) })
  }

  async function updateLogoImage(value: string, ctx: UpdateCtx) {
    await update(reqId(ctx), { logo_image: optionalString(value) })
  }

  async function updateWordmarkImage(value: string, ctx: UpdateCtx) {
    await update(reqId(ctx), { wordmark_image: optionalString(value) })
  }

  async function updateMediaBackdropColor(value: string, ctx: UpdateCtx) {
    const color = normalizeHexColor(value)
    if (color === null) throw new Error('Use a 6-digit hex colour.')
    await update(reqId(ctx), { media_backdrop_color: color || null })
  }

  async function updatePhone(value: string, ctx: UpdateCtx) {
    await update(reqId(ctx), { phone: optionalString(value) })
  }

  async function updateEmail(value: string, ctx: UpdateCtx) {
    await update(reqId(ctx), { email: optionalString(value) })
  }

  async function updateWebsite(value: string, ctx: UpdateCtx) {
    await update(reqId(ctx), { website: optionalString(value) })
  }

  async function updateDefaultCurrencyCode(value: string, ctx: UpdateCtx) {
    const code = sanitize(value).toUpperCase()
    if (code && !/^[A-Z]{3}$/.test(code)) {
      throw new Error('Currency must be a 3-letter ISO code')
    }
    await update(reqId(ctx), { default_currency_code: code || null })
  }

  async function updateTimezone(value: string, ctx: UpdateCtx) {
    const timezone = sanitize(value)
    if (timezone) {
      try {
        new Intl.DateTimeFormat('en', { timeZone: timezone }).format()
      } catch {
        throw new Error('Use a valid IANA timezone, such as Europe/Zurich')
      }
    }
    await update(reqId(ctx), { timezone: timezone || null })
  }

  async function updateBusinessHours(
    value: PlaceBusinessHours,
    ctx: UpdateCtx
  ) {
    await update(reqId(ctx), {
      business_hours: normalizePlaceBusinessHours(value),
    })
  }

  async function updateBrandTagline(value: string, ctx: UpdateCtx) {
    await update(reqId(ctx), { tagline: optionalString(value) })
  }

  async function updateAbout(value: string, ctx: UpdateCtx) {
    await update(reqId(ctx), { about: optionalString(value) })
  }

  async function updateCoverImage(value: string, ctx: UpdateCtx) {
    await update(reqId(ctx), { cover_image: optionalString(value) })
  }

  async function updateGalleryImages(value: string[], ctx: UpdateCtx) {
    const galleryImages = Array.from(
      new Set(value.map(sanitize).filter(Boolean))
    )
    await update(reqId(ctx), {
      gallery_images: galleryImages.length ? galleryImages : null,
    })
  }

  async function updateSocialLinks(value: PlaceSocialLinks, ctx: UpdateCtx) {
    const socialLinks = Object.fromEntries(
      Object.entries(value)
        .map(([key, link]) => [key, sanitize(link)] as const)
        .filter(([, link]) => Boolean(link))
    )
    await update(reqId(ctx), {
      social_links: Object.keys(socialLinks).length ? socialLinks : null,
    })
  }

  async function updateClaimedBy(
    _value: string,
    _ctx: UpdateCtx
  ): Promise<never> {
    throw new Error(
      'Place claiming requires a verified ownership workflow and is not currently available.'
    )
  }

  return {
    updateIdentity: (patch: Partial<PlaceIdentityDraft>, ctx: UpdateCtx) =>
      update(reqId(ctx), patch),
    updateName,
    updateShortName,
    updateFormattedAddress,
    updateShortAddress,
    updateSearchTerm,
    updateLat,
    updateLng,
    updatePlaceImage,
    updateLogoImage,
    updateWordmarkImage,
    updateMediaBackdropColor,
    updatePhone,
    updateEmail,
    updateWebsite,
    updateDefaultCurrencyCode,
    updateTimezone,
    updateBusinessHours,
    updateBrandTagline,
    updateAbout,
    updateCoverImage,
    updateGalleryImages,
    updateSocialLinks,
    updateClaimedBy,
  }
}
