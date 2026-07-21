// Concurrent edit — 2026-07-20 20:51 CEST — Place-root authority pass: persist only present shared currency and business-hours onboarding data.
// Concurrent edit — 2026-07-21 14:08 CEST — Werkbox Firebase hardening: route idempotent Place creation through the authenticated server boundary.
import { useImageStorage } from 'fireux-core/runtime/composables/fireux/firebase/useImageStorage'
import { useRequireUser } from 'fireux-core/runtime/composables/fireux/firebase/useRequireUser'
import { defineFireuxCreatePlan } from 'fireux-core/runtime/composables/fireux/firestore/operations/createStrategy'
import type { PlaceUpsertInput } from 'fireux-places/runtime/models/place.model'
import { canonicalPlaceId, fetchPlaceDetails } from '../fetch/google/usePlacesGoogle'
import { toShortAddress } from '../utils/view/formatPlaceAddress'
import { toPlaceSlug } from '../utils/view/toPlaceSlug'
import { sanitizeLogoAvatar } from '../utils/view/usePlaceLogos'
import { normalizePlaceBusinessHours } from '../../../../../utils/place-spine'

export interface UsePlaceCreateOptions {
  type?: string | null | undefined
  types?: string[]
}

export const PlaceCreatePlan = defineFireuxCreatePlan({
  family: 'with_provision',
})

const normalizeString = (value: unknown) => String(value ?? '').trim()
const normalizeStringArray = (value: unknown): string[] =>
  Array.isArray(value)
    ? Array.from(new Set(value.map(normalizeString).filter(Boolean)))
    : []

const normalizeHttpsUrl = (value: unknown) => {
  const source = normalizeString(value)
  if (!source) return ''
  try {
    const url = new URL(source)
    return url.protocol === 'https:' && !url.username && !url.password
      ? url.toString()
      : ''
  } catch {
    return ''
  }
}

const normalizeAddress = (value: unknown) => {
  const source = (value ?? {}) as Record<string, unknown>
  return compactRecord({
    street: normalizeString(source.street),
    city: normalizeString(source.city),
    region: normalizeString(source.region),
    postal_code: normalizeString(source.postal_code),
    country_code: normalizeString(source.country_code),
  })
}

const normalizeSocialLinks = (value: unknown) => {
  const source = (value ?? {}) as Record<string, unknown>
  return compactRecord({
    website: normalizeHttpsUrl(source.website),
    instagram: normalizeHttpsUrl(source.instagram),
    facebook: normalizeHttpsUrl(source.facebook),
    tiktok: normalizeHttpsUrl(source.tiktok),
    linkedin: normalizeHttpsUrl(source.linkedin),
    youtube: normalizeHttpsUrl(source.youtube),
  })
}

function compactRecord(source: Record<string, unknown>) {
  return Object.fromEntries(
    Object.entries(source).filter(([, value]) => {
      if (typeof value === 'string') return Boolean(value.trim())
      if (Array.isArray(value)) return value.length > 0
      if (value && typeof value === 'object') return Object.keys(value).length > 0
      if (typeof value === 'boolean') return value
      return value !== null && value !== undefined
    })
  )
}

function putString(target: Record<string, unknown>, key: string, value: unknown) {
  const next = normalizeString(value)
  if (next) target[key] = next
}

function putHttpsUrl(target: Record<string, unknown>, key: string, value: unknown) {
  const next = normalizeHttpsUrl(value)
  if (next) target[key] = next
}

function putStringArray(target: Record<string, unknown>, key: string, value: unknown) {
  const next = normalizeStringArray(value)
  if (next.length) target[key] = next
}

function putObject(target: Record<string, unknown>, key: string, value: Record<string, unknown>) {
  if (Object.keys(value).length) target[key] = value
}

export function usePlaceCreate(_options: UsePlaceCreateOptions = {}) {
  const { uploadFromUrl } = useImageStorage()

  async function ensurePlaceExists(
    place: Partial<PlaceUpsertInput> & { id?: string }
  ): Promise<boolean> {
    const id = canonicalPlaceId((place as any)?.id ?? (place as any)?.place_id)
    if (!id) return false

    if (import.meta.dev) {
      console.log('[fireux-places] ensure:start', {
        id,
        incoming_place_image: (place as any)?.place_image ?? '',
        incoming_image_url: (place as any)?.image_url ?? '',
        incoming_source: (place as any)?.source ?? '',
      })
    }

    const latValueInitial = Number((place as any)?.lat)
    const lngValueInitial = Number((place as any)?.lng)
    const hasCoordsInitial =
      Number.isFinite(latValueInitial) && Number.isFinite(lngValueInitial)
    const isZeroCoordsInitial =
      hasCoordsInitial && latValueInitial === 0 && lngValueInitial === 0
    const shouldHydrate =
      !hasCoordsInitial ||
      isZeroCoordsInitial ||
      normalizeString((place as any)?.source) === 'google'

    if (shouldHydrate) {
      const details = await fetchPlaceDetails(id)
      if (details?.google) {
        const currentImage =
          normalizeString((place as any)?.image_url) ||
          normalizeString((place as any)?.place_image)
        place = {
          ...place,
          ...details.stored,
          image_url: currentImage || details.google.image_url || '',
          source: (place as any)?.source ?? 'google',
        }
        if (import.meta.dev) {
          console.log('[fireux-places] ensure:hydrated', {
            id,
            hydrated_place_image:
              (place as any)?.image_url ?? (place as any)?.place_image ?? '',
            hydrated_source: (place as any)?.source ?? '',
          })
        }
      }
    }

    const name =
      typeof (place as any)?.name === 'string' ? String((place as any).name) : ''
    if (!normalizeString(name)) {
      if (import.meta.dev) {
        console.warn('[fireux-places] Skipping place with missing name', { id })
      }
      return false
    }

    const shortName =
      typeof (place as any)?.short_name === 'string'
        ? normalizeString((place as any).short_name)
        : ''
    const formatted =
      typeof (place as any)?.formatted_address === 'string'
        ? String((place as any).formatted_address)
        : ''
    const shortAddress = toShortAddress(
      typeof (place as any)?.short_address === 'string'
        ? String((place as any).short_address)
        : formatted
    )
    const placeImageRaw =
      (place as any)?.image_url ?? (place as any)?.place_image
    const remoteImageUrl =
      typeof placeImageRaw === 'string' ? normalizeString(placeImageRaw) : ''
    if (import.meta.dev) {
      console.log('[fireux-places] ensure:image-raw', {
        id,
        placeImageRaw: placeImageRaw ?? '',
        remoteImageUrl,
      })
    }

    let image_url = sanitizeLogoAvatar(remoteImageUrl) ?? ''
    const latValue = Number((place as any)?.lat)
    const lngValue = Number((place as any)?.lng)
    const lat = Number.isFinite(latValue) ? latValue : 0
    const lng = Number.isFinite(lngValue) ? lngValue : 0
    if (
      !Number.isFinite(latValue) ||
      !Number.isFinite(lngValue) ||
      (lat === 0 && lng === 0)
    ) {
      if (import.meta.dev) {
        console.warn('[fireux-places] Skipping place with missing coords', {
          id,
          lat,
          lng,
        })
      }
      return false
    }

    if (import.meta.dev) {
      console.log('[fireux-places] image:pre-upload', {
        id,
        image_url,
        isFirebaseUrl: image_url.includes('firebasestorage.googleapis.com'),
      })
    }

    if (image_url && !image_url.includes('firebasestorage.googleapis.com')) {
      try {
        const uploaded = await uploadFromUrl(`${PlaceStorage.collection}/${id}/image`, image_url)
        if (import.meta.dev) {
          console.log('[fireux-places] image:uploaded', {
            id,
            from: image_url,
            to: uploaded,
          })
        }
        image_url = uploaded
      } catch (e) {
        if (import.meta.dev) console.warn('[fireux-places] avatar upload failed', e)
        image_url = ''
      }
    }

    const searchTermRaw = (place as any)?.search_term
    const searchTerm =
      typeof searchTermRaw === 'string' && normalizeString(searchTermRaw).length
        ? normalizeString(searchTermRaw)
        : normalizeString(`${name} ${formatted}`.toLowerCase())
    const normalizedSearchTerm = normalizeString(
      searchTerm
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
    )

    const shadeRaw =
      typeof (place as any)?.image_shade === 'string'
        ? normalizeString((place as any).image_shade).toLowerCase()
        : ''
    const image_shade =
      shadeRaw === 'light' || shadeRaw === 'dark' || shadeRaw === 'none'
        ? shadeRaw
        : 'none'

    const slug = toPlaceSlug(name)

    const payload = {
      source: 'fireux',
      name: normalizeString(name),
      lat,
      lng,
      place_type: 'physical',
      search_term: normalizedSearchTerm,
    } as Record<string, unknown>

    putString(payload, 'formatted_address', formatted)
    putString(payload, 'short_address', shortAddress)
    putString(payload, 'short_name', shortName)
    putString(payload, 'brand_tagline', (place as any)?.brand_tagline)
    putString(payload, 'about', (place as any)?.about)
    putObject(payload, 'address', normalizeAddress((place as any)?.address))
    const timezone = normalizeString((place as any)?.timezone)
    putString(payload, 'timezone', timezone)
    putString(payload, 'slug', slug)
    putHttpsUrl(payload, 'image_url', image_url)
    putHttpsUrl(payload, 'cover_image', (place as any)?.cover_image)
    const galleryImages = normalizeStringArray((place as any)?.gallery_images)
      .map(normalizeHttpsUrl)
      .filter(Boolean)
    putStringArray(payload, 'gallery_images', galleryImages)
    if (image_shade === 'light' || image_shade === 'dark') {
      payload.image_shade = image_shade
    }
    putString(payload, 'phone', (place as any)?.phone)
    putString(payload, 'email', (place as any)?.email)
    putHttpsUrl(payload, 'website', (place as any)?.website)
    putHttpsUrl(payload, 'google_maps_url', (place as any)?.google_maps_url)
    putObject(payload, 'social_links', normalizeSocialLinks((place as any)?.social_links))
    putStringArray(payload, 'types', (place as any)?.types)
    putStringArray(payload, 'tags', (place as any)?.tags)
    putString(payload, 'price_level', (place as any)?.price_level)
    putString(
      payload,
      'default_currency_code',
      normalizeString((place as any)?.default_currency_code).toUpperCase()
    )
    const businessHours = normalizePlaceBusinessHours(
      (place as any)?.business_hours
    )
    if (businessHours && timezone) putObject(payload, 'business_hours', businessHours)
    putString(payload, 'claimed_by', (place as any)?.claimed_by)

    if (import.meta.dev) {
      console.log('[fireux-places] create:payload', {
        id,
        image_url: payload.image_url ?? '',
        name: payload.name ?? '',
        formatted_address: payload.formatted_address ?? '',
      })
    }

    const user = await useRequireUser()
    const token = await user.getIdToken()
    const result = await $fetch<{ ok: boolean; id: string; created: boolean }>(
      '/api/places/ensure',
      {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: { id, place: payload },
      }
    )
    if (
      result?.ok !== true ||
      result.id !== id ||
      typeof result.created !== 'boolean'
    ) {
      throw new Error('[usePlaceCreate] Place ensure response was invalid.')
    }

    if (import.meta.dev) {
      console.log(
        `[fireux-places] ${result.created ? 'Created' : 'Reused'} Place: ${id}`
      )
    }

    return true
  }

  return {
    createPlan: PlaceCreatePlan,
    ensurePlaceExists,
    createPlace: ensurePlaceExists,
  }
}
