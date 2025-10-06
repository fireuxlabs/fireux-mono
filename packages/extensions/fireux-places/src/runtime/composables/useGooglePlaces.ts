import { ref } from 'vue'
import type { Place, PlaceCard } from '../models/place.model'

const PLACE_ICON_FALLBACK =
  'https://maps.gstatic.com/mapfiles/place_api/icons/v1/png_71/geocode-71.png'

// Structured result wrapper (new enhanced method)
export interface PlacesAutocompleteSuccess {
  success: true
  data: PlaceCard.Cell[]
  strategy: string
  diagnostics?: Record<string, any>
}
export interface PlacesAutocompleteFailure {
  success: false
  error: string
  strategy: string | null
  diagnostics?: Record<string, any>
}
export type PlacesAutocompleteResultWrapper =
  | PlacesAutocompleteSuccess
  | PlacesAutocompleteFailure

// (Legacy script management removed for autocomplete; still kept minimal flags for potential map/details future use)
let requestedSrc: string | null = null

// Shared reactive state (reduced)
const isScriptLoaded = ref(true) // treat as loaded for autocomplete-only usage
const isLoading = ref(false)
const error = ref<string | null>(null)
const lastStrategy = ref<'server-rest' | 'cache' | 'unavailable' | null>(null)
const lastDiagnostics = ref<Record<string, any> | null>(null)

// Feature / environment flags (legacy paths removed => always modern via server proxy)
let apiTargetBlocked = false

// Session token (groups multiple related autocomplete requests)
let sessionToken: string | null = null
function getSessionToken() {
  if (!sessionToken) sessionToken = Math.random().toString(36).slice(2)
  return sessionToken
}
function resetSessionToken() {
  sessionToken = null
}

// Caches
const predictionCache = new Map<string, PlaceCard.Cell[]>()
const detailsCache = new Map<string, Place>()
const WEBSITE_LOGO_ENDPOINT = '/api/places/logo'

function generateTempId() {
  if (
    typeof crypto !== 'undefined' &&
    typeof crypto.randomUUID === 'function'
  ) {
    return crypto.randomUUID()
  }
  return `temp_${Math.random().toString(36).slice(2)}`
}

function mapPredictionToCell(prediction: any): PlaceCard.Cell {
  return {
    id: prediction?.place_id ?? generateTempId(),
    name:
      prediction?.structured_formatting?.main_text ||
      prediction?.description ||
      'Unknown place',
    avatar: PLACE_ICON_FALLBACK,
    formatted_address:
      prediction?.structured_formatting?.secondary_text ||
      prediction?.description ||
      undefined,
    rating: null,
    meta_right: 'Google',
  }
}

// loadGoogleScript removed – server proxy handles autocomplete. NOTE: getPlaceDetails now falls back to server endpoint; legacy inline JS path retained only when script already present.

// Backoff helper
async function withRetry<T>(fn: () => Promise<T>, attempts = 2): Promise<T> {
  let lastErr: any
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn()
    } catch (e) {
      lastErr = e
      if (i < attempts - 1) {
        const delay = (2 ** i + Math.random()) * 200
        await new Promise((r) => setTimeout(r, delay))
      }
    }
  }
  throw lastErr
}

function buildDiagnostics(extra: Record<string, any> = {}) {
  const diag = {
    apiTargetBlocked,
    legacyRemoved: true,
    lastStrategy: lastStrategy.value,
    ...extra,
  } as Record<string, any>
  if (apiTargetBlocked) {
    diag.guidance = [
      'Enable Places API & Maps JavaScript API in Google Cloud Console.',
      'Verify billing is active.',
      'Check key restrictions: include required APIs or remove API restriction for testing.',
      'Legacy AutocompleteService removed; using server proxy to modern REST endpoint.',
    ]
  }
  lastDiagnostics.value = diag
  return diag
}

async function serverAutocomplete(
  query: string,
  _apiKey: string, // kept for signature compatibility; server holds the key
  types: string = 'address'
): Promise<PlaceCard.Cell[]> {
  const params = new URLSearchParams({
    q: query,
    sessiontoken: getSessionToken(),
    types,
  })
  const res = await withRetry(() =>
    fetch(`/api/places/autocomplete?${params.toString()}`)
  )
  if (!res.ok) throw new Error(`Server autocomplete HTTP ${res.status}`)
  const data = await res.json()
  if (data.error) {
    if (data.error === 'REQUEST_DENIED') apiTargetBlocked = true
    throw new Error(`Server autocomplete error: ${data.error}`)
  }
  const preds = Array.isArray(data.predictions) ? data.predictions : []
  const mapped = preds.map(mapPredictionToCell)
  predictionCache.set(query, mapped)
  lastStrategy.value = 'server-rest'
  return mapped
}

/** Backwards compatible simple search returning just array */
async function searchPlacesArray(
  query: string,
  apiKey: string,
  types: string = 'address'
): Promise<PlaceCard.Cell[]> {
  const result = await searchPlacesWithMeta(query, apiKey, types)
  if (result.success) return result.data
  if (import.meta.dev) {
    // eslint-disable-next-line no-console
    console.debug(
      '[places] autocomplete failed',
      result.error,
      result.diagnostics
    )
  }
  return []
}

function buildWebsiteFavicon(url?: string | null) {
  if (!url) return null
  try {
    const normalized = new URL(url.startsWith('http') ? url : `https://${url}`)
    return `https://www.google.com/s2/favicons?sz=128&domain_url=${encodeURIComponent(
      normalized.origin
    )}`
  } catch {
    return null
  }
}

function isGoogleFallbackAvatar(avatar?: string | null) {
  if (!avatar) return true
  const lower = avatar.toLowerCase()
  return lower.includes('maps.gstatic.com/mapfiles/place_api/icons')
}

async function fetchWebsiteLogo(website?: string | null) {
  if (!website) return null
  try {
    const endpoint = `${WEBSITE_LOGO_ENDPOINT}?website=${encodeURIComponent(
      website
    )}`
    const res = await fetch(endpoint)
    if (!res.ok) return null
    const data = await res.json()
    return typeof data?.url === 'string' ? data.url : null
  } catch {
    return null
  }
}

async function enhancePlaceAvatar(place: Place, raw: any) {
  if (place.avatar && !isGoogleFallbackAvatar(place.avatar)) return place

  const candidates: Array<string | null | undefined> = [
    raw?.website,
    place.website,
    raw?.url,
  ]

  for (const candidate of candidates) {
    const logo = await fetchWebsiteLogo(candidate ?? undefined)
    if (logo) {
      return {
        ...place,
        avatar: logo,
      }
    }
  }

  const favicon = buildWebsiteFavicon(place.website || raw?.website)
  if (favicon) {
    return {
      ...place,
      avatar: favicon,
    }
  }

  return place
}

function resolvePhotoUrl(place: any) {
  const photos = place?.photos
  if (Array.isArray(photos) && photos.length > 0) {
    const photo = photos[0]
    if (typeof photo?.getUrl === 'function') {
      return photo.getUrl({ maxWidth: 400 })
    }
    if (photo?.photo_reference) {
      const params = new URLSearchParams({
        ref: photo.photo_reference,
        maxwidth: String(Math.min(photo.width ?? 400, 400)),
      })
      return `/api/places/photo?${params.toString()}`
    }
    if (typeof photo?.url === 'string') return photo.url
  }
  if (typeof place?.icon === 'string') return place.icon
  if (typeof place?.icon_mask_base_uri === 'string')
    return place.icon_mask_base_uri
  return null
}

function mapGooglePlace(place: any, fallbackId?: string): Place {
  const location = place?.geometry?.location
  const latCandidate =
    typeof location?.lat === 'function' ? location.lat() : location?.lat
  const lngCandidate =
    typeof location?.lng === 'function' ? location.lng() : location?.lng

  const lat =
    typeof latCandidate === 'number' ? latCandidate : Number(latCandidate) || 0
  const lng =
    typeof lngCandidate === 'number' ? lngCandidate : Number(lngCandidate) || 0
  const id = place?.place_id ?? fallbackId ?? generateTempId()

  const avatar =
    resolvePhotoUrl(place) ??
    buildWebsiteFavicon(place?.website) ??
    PLACE_ICON_FALLBACK

  return {
    id,
    name: place?.name ?? place?.formatted_address ?? 'Unknown place',
    formatted_address: place?.formatted_address ?? '',
    lat,
    lng,
    avatar,
    source: 'google',
    website: place?.website ?? null,
    phone:
      place?.international_phone_number ??
      place?.formatted_phone_number ??
      null,
    rating: typeof place?.rating === 'number' ? place.rating : null,
    user_ratings_total:
      typeof place?.user_ratings_total === 'number'
        ? place.user_ratings_total
        : null,
    created_at: place?.created_at ?? null,
    updated_at: place?.updated_at ?? null,
  }
}

export async function getPlaceDetails(
  placeId: string,
  _apiKey: string
): Promise<Place> {
  if (detailsCache.has(placeId)) return detailsCache.get(placeId) as Place

  isLoading.value = true
  error.value = null

  const handleSuccess = async (raw: any) => {
    let mapped = mapGooglePlace(raw, placeId)
    mapped = await enhancePlaceAvatar(mapped, raw)
    if (!mapped.avatar) {
      mapped.avatar =
        buildWebsiteFavicon(raw?.website ?? mapped.website ?? undefined) ||
        PLACE_ICON_FALLBACK
    }
    detailsCache.set(placeId, mapped)
    return mapped
  }

  try {
    if (typeof window !== 'undefined' && (window as any).google?.maps?.places) {
      return await new Promise<Place>((resolve, reject) => {
        const g = (window as any).google.maps.places
        const service = new g.PlacesService(document.createElement('div'))
        service.getDetails(
          {
            placeId,
            fields: [
              'place_id',
              'formatted_address',
              'name',
              'geometry',
              'website',
              'international_phone_number',
              'formatted_phone_number',
              'rating',
              'user_ratings_total',
              'icon',
              'icon_mask_base_uri',
              'photos',
            ],
          },
          async (place: any, status: string) => {
            if (status === g.PlacesServiceStatus.OK && place) {
              try {
                const enhanced = await handleSuccess(place)
                resolve(enhanced)
              } catch (err) {
                reject(err instanceof Error ? err : new Error(String(err)))
              }
            } else {
              reject(new Error(`Place details failed: ${status}`))
            }
          }
        )
      })
    }

    const params = new URLSearchParams({ place_id: placeId })
    const res = await fetch(`/api/places/details?${params.toString()}`)
    if (!res.ok) throw new Error(`Server details HTTP ${res.status}`)
    const data = await res.json()
    if (data.error) throw new Error(`Server details error: ${data.error}`)
    if (data.result) return await handleSuccess(data.result)
    throw new Error('Place details not found')
  } catch (e: any) {
    error.value = e?.message ?? String(e)
    throw e
  } finally {
    isLoading.value = false
  }
}

export async function searchPlacesWithMeta(
  query: string,
  apiKey: string,
  types: string = 'address'
): Promise<PlacesAutocompleteResultWrapper> {
  if (!query.trim())
    return { success: false, error: 'Empty query', strategy: null }
  const cached = predictionCache.get(query)
  if (cached) {
    lastStrategy.value = 'cache'
    return { success: true, data: cached, strategy: 'cache' }
  }
  isLoading.value = true
  error.value = null
  try {
    const mapped = await serverAutocomplete(query, apiKey, types)
    lastStrategy.value = 'server-rest'
    return {
      success: true,
      data: mapped,
      strategy: 'server-rest',
      diagnostics: buildDiagnostics({ phase: 'server-rest-success' }),
    }
  } catch (e: any) {
    lastStrategy.value = 'unavailable'
    error.value = e?.message ?? String(e)
    return {
      success: false,
      error: e?.message ?? String(e),
      strategy: lastStrategy.value,
      diagnostics: buildDiagnostics({ phase: 'server-rest-failed' }),
    }
  } finally {
    isLoading.value = false
  }
}

export function useGooglePlaces() {
  return {
    // State
    isScriptLoaded,
    isLoading,
    error,
    lastStrategy,
    lastDiagnostics,
    // Methods
    searchPlaces: searchPlacesArray,
    searchPlacesWithMeta,
    getPlaceDetails,
    resetSessionToken,
    // Legacy API removed (placeholder retained for compatibility)
    enableLegacyAutocomplete: () => {
      /* no-op */
    },
    // Debug
    _requestedSrc: requestedSrc,
  }
}
