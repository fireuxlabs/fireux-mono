import { ref } from 'vue'
import type { PlaceAutocompleteResult, Place } from '../models/place.model'

// Structured result wrapper (new enhanced method)
export interface PlacesAutocompleteSuccess {
  success: true
  data: PlaceAutocompleteResult[]
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
const predictionCache = new Map<string, PlaceAutocompleteResult[]>()
const detailsCache = new Map<string, Place>()

function markLoaded() {
  isScriptLoaded.value = true
  isLoading.value = false
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
): Promise<PlaceAutocompleteResult[]> {
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
  const preds = data.predictions || []
  const mapped: PlaceAutocompleteResult[] = preds.map((p: any) => ({
    place_id: p.place_id,
    description: p.description,
    structured_formatting: p.structured_formatting,
    types: p.types,
  }))
  predictionCache.set(query, mapped)
  lastStrategy.value = 'server-rest'
  return mapped
}

/** Backwards compatible simple search returning just array */
async function searchPlacesArray(
  query: string,
  apiKey: string,
  types: string = 'address'
): Promise<PlaceAutocompleteResult[]> {
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

export async function getPlaceDetails(
  placeId: string,
  apiKey: string
): Promise<Place> {
  if (detailsCache.has(placeId)) return detailsCache.get(placeId) as Place
  // Temporary: still using client JS API if available; otherwise fetch via server details endpoint
  if (detailsCache.has(placeId)) return detailsCache.get(placeId) as Place
  if (typeof window !== 'undefined' && (window as any).google?.maps?.places) {
    return new Promise((resolve, reject) => {
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
            'address_components',
            'types',
          ],
        },
        (place: any, status: string) => {
          if (status === g.PlacesServiceStatus.OK && place) {
            detailsCache.set(placeId, place as Place)
            resolve(place as Place)
          } else {
            reject(new Error(`Place details failed: ${status}`))
          }
        }
      )
    })
  }
  // Fallback to server details API
  const params = new URLSearchParams({ id: placeId })
  const res = await fetch(`/api/places/details?${params.toString()}`)
  if (!res.ok) throw new Error(`Server details HTTP ${res.status}`)
  const data = await res.json()
  if (data.error) throw new Error(`Server details error: ${data.error}`)
  if (data.result) {
    detailsCache.set(placeId, data.result as Place)
    return data.result as Place
  }
  throw new Error('Place details not found')
}

export async function searchPlacesWithMeta(
  query: string,
  apiKey: string,
  types: string = 'address'
): Promise<PlacesAutocompleteResultWrapper> {
  if (!query.trim())
    return { success: false, error: 'Empty query', strategy: null }
  const cached = predictionCache.get(query)
  if (cached) return { success: true, data: cached, strategy: 'cache' }
  // Server proxy (modern single path)
  try {
    const mapped = await serverAutocomplete(query, apiKey, types)
    return {
      success: true,
      data: mapped,
      strategy: 'server-rest',
      diagnostics: buildDiagnostics({ phase: 'server-rest-success' }),
    }
  } catch (e: any) {
    lastStrategy.value = 'unavailable'
    return {
      success: false,
      error: e.message,
      strategy: lastStrategy.value,
      diagnostics: buildDiagnostics({ phase: 'server-rest-failed' }),
    }
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
