// FILE: packages/extensions/fireux-places/src/runtime/composables/fireux/firestore/place/mutations/usePlaceUpdate.ts
// Concurrent edit — 2026-07-20 21:57 CEST — Place-root authority pass: route sparse Place configuration through the trusted owner/operator boundary.

import { useRequireUser } from 'fireux-core/runtime/composables/fireux/firebase/useRequireUser'
import { toValue, type MaybeRefOrGetter } from 'vue'
import type {
  Place,
  PlaceBusinessHours,
  PlaceImageShade,
  PlaceSocialLinks,
} from 'fireux-places/runtime/models/place.model'
import { normalizePlaceBusinessHours } from '../../../../../utils/place-spine'

type UpdateCtx = { id: string | null | undefined }

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
  const number = typeof value === 'number'
    ? value
    : Number(String(value ?? '').trim())
  if (!Number.isFinite(number)) throw new Error('Value must be a number')
  return number
}

function toShade(value: unknown): PlaceImageShade {
  const shade = String(value ?? 'none').toLowerCase().trim()
  if (shade === 'light' || shade === 'dark' || shade === 'none') return shade
  return 'none'
}

function resolvedAuthority(options: UsePlaceUpdateOptions) {
  const authority = options.authority ? toValue(options.authority) : null
  const appId = sanitize(authority?.appId)
  const kitchenId = sanitize(authority?.kitchenId)

  return appId && kitchenId ? { app_id: appId, kitchen_id: kitchenId } : {}
}

export async function updatePlaceDocument(
  placeId: string,
  patch: Partial<Record<keyof Place, unknown>>,
  options: UsePlaceUpdateOptions = {}
) {
  const id = String(placeId || '').trim()
  if (!id) throw new Error('Place id is required')

  const user = await useRequireUser()
  const token = await user.getIdToken()

  await $fetch(`/api/places/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${token}` },
    body: {
      patch,
      ...resolvedAuthority(options),
    },
  })
}

/**
 * Central Place updates. The browser sends intent only; the server validates
 * owner, App-admin, or explicitly linked Kitchen-operator authority.
 */
export function usePlaceUpdate(options: UsePlaceUpdateOptions = {}) {
  const update = (id: string, patch: Partial<Record<keyof Place, unknown>>) =>
    updatePlaceDocument(id, patch, options)

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

  async function updateImageShade(value: PlaceImageShade | string, ctx: UpdateCtx) {
    const shade = toShade(value)
    await update(reqId(ctx), { image_shade: shade === 'none' ? null : shade })
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

  async function updateBusinessHours(value: PlaceBusinessHours, ctx: UpdateCtx) {
    await update(reqId(ctx), {
      business_hours: normalizePlaceBusinessHours(value),
    })
  }

  async function updateBrandTagline(value: string, ctx: UpdateCtx) {
    await update(reqId(ctx), { brand_tagline: optionalString(value) })
  }

  async function updateAbout(value: string, ctx: UpdateCtx) {
    await update(reqId(ctx), { about: optionalString(value) })
  }

  async function updateCoverImage(value: string, ctx: UpdateCtx) {
    await update(reqId(ctx), { cover_image: optionalString(value) })
  }

  async function updateGalleryImages(value: string[], ctx: UpdateCtx) {
    const galleryImages = Array.from(new Set(value.map(sanitize).filter(Boolean)))
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

  async function updateClaimedBy(value: string, ctx: UpdateCtx) {
    await update(reqId(ctx), { claimed_by: optionalString(value) })
  }

  return {
    updateName,
    updateShortName,
    updateFormattedAddress,
    updateShortAddress,
    updateSearchTerm,
    updateLat,
    updateLng,
    updatePlaceImage,
    updateImageShade,
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
