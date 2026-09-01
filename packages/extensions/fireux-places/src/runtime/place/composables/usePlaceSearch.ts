import { ref, watch, type Ref } from 'vue'
import type {
  BasePlace,
  BasePlaceRecord,
  PlaceSearchLocation,
  PlaceSearchSource,
} from './firestore/fetch/search/types'
import type { PlaceImageShade } from '../utils/place-spine'
import { mapPlaceToBasePlace } from './firestore/utils/view/mapPlaceToBasePlace'
import { canonicalPlaceId } from './firestore/fetch/google/usePlacesGoogle'
import { normalizeQuery } from './firestore/fetch/search/normalizeQuery'
import { searchPrimary } from './firestore/fetch/search/searchPrimary'
import { searchGoogle } from './firestore/fetch/search/searchGoogle'

export type {
  BasePlace,
  PlaceSearchLocation,
} from './firestore/fetch/search/types'

type UsePlaceSearchOptions = {
  allowGoogle?: boolean
  debugLabel?: string
  debounceMs?: number
  location?: Ref<PlaceSearchLocation | null>
  type?: string | null
}

export function usePlaceSearch(options: UsePlaceSearchOptions = {}) {
  const query = ref('')
  const results = ref<PlaceSearchCell[]>([])
  const selected = ref<BasePlaceRecord | null>(null)
  const isSearching = ref(false)
  let debounceTimer: ReturnType<typeof setTimeout> | null = null
  let searchSequence = 0

  const debug = ref<Record<string, unknown> | null>(null)

  const mapToBasePlace = mapPlaceToBasePlace()

  const toSearchCell = (base: BasePlaceRecord): PlaceSearchCell | null => {
    if (!base) return null
    const id = String(base.id ?? '').trim()
    if (!id) return null
    const name = String(base.name ?? '').trim()
    const shortName = String(base.short_name ?? '').trim()
    const formattedAddress = String(base.formatted_address ?? '').trim()
    const shortAddress = String(base.short_address ?? '').trim()
    const imageUrl = String(base.image_url ?? '').trim()
    const imageShade = base.image_shade as PlaceImageShade | undefined
    const source = base.source as PlaceSearchSource | undefined
    const claimedBy = String(base.claimed_by ?? '').trim()
    const collection = String(base.collection ?? '').trim() || undefined
    const lat = Number(base.lat)
    const lng = Number(base.lng)
    return {
      id,
      name,
      shortName,
      formattedAddress,
      shortAddress,
      imageUrl,
      imageShade,
      source,
      claimedBy,
      collection,
      ...(Number.isFinite(lat) ? { lat } : {}),
      ...(Number.isFinite(lng) ? { lng } : {}),
    }
  }

  async function searchPlaces(q: string) {
    const sequence = ++searchSequence
    const term = q.trim().toLowerCase()
    const termNormalized = term ? normalizeQuery(term) : ''

    if (import.meta.dev && options.debugLabel) {
      console.log(`[${options.debugLabel}][search] firestore-term`, {
        term,
        termNormalized,
      })
    }

    if (!term) {
      results.value = []
      if (import.meta.dev) debug.value = { stage: 'idle' }
      return
    }

    isSearching.value = true
    try {
      let primaryResults: PlaceSearchCell[] = []
      let primaryDebug: Record<string, unknown> | null = null

      try {
        const primary = await searchPrimary({
          term,
          termNormalized,
          mapToCard: mapToBasePlace,
        })
        if (primary) {
          primaryResults = primary.results
            .map((row) => toSearchCell(row))
            .filter(Boolean) as PlaceSearchCell[]
          primaryDebug = primary.debug ?? null
        } else if (import.meta.dev && options.debugLabel) {
          primaryDebug = { stage: 'firebase', count: 0 }
        }
      } catch (err) {
        if (import.meta.dev) {
          primaryDebug = {
            stage: 'firestore-error',
            error: err instanceof Error ? err.message : String(err),
          }
        }
      }

      const googleLocation =
        normalizeLocation(options.location?.value) ||
        locationFromResults(primaryResults)
      const google = await searchGoogle({
        term,
        allowGoogle:
          options.allowGoogle === true ||
          Boolean(googleLocation) ||
          term.split(/\s+/).length > 1,
        location: googleLocation,
        mapToCard: mapToBasePlace,
        type: options.type ?? null,
      })

      const googleCards = google.results
        .map((row) => toSearchCell(row))
        .filter(Boolean) as PlaceSearchCell[]

      if (sequence !== searchSequence) return

      if (primaryResults.length) {
        const existingIds = new Set(
          primaryResults.map((r) => canonicalPlaceId(r.id) || r.id)
        )
        const additions = googleCards.filter(
          (r) => !existingIds.has(canonicalPlaceId(r.id) || r.id)
        )
        results.value = [...primaryResults, ...additions]
      } else {
        results.value = googleCards
      }

      if (import.meta.dev) {
        debug.value = {
          primary: primaryDebug,
          google: google.debug ?? null,
        }
      }

      if (import.meta.dev && options.debugLabel) {
        console.log(`[${options.debugLabel}][search] stages`, {
          primary: primaryDebug,
          primaryCount: primaryResults.length,
          googleCount: google.results.length,
          mergedCount: results.value.length,
        })
      }
    } finally {
      if (sequence === searchSequence) isSearching.value = false
    }
  }

  watch(query, (q: string) => {
    if (debounceTimer) clearTimeout(debounceTimer)
    searchSequence++
    results.value = []
    if (!q.trim()) {
      void searchPlaces(q)
      return
    }
    debounceTimer = setTimeout(
      () => void searchPlaces(q),
      Math.max(0, options.debounceMs ?? 450)
    )
  })

  function select(place: BasePlace) {
    const id = canonicalPlaceId(place.id) || place.id
    selected.value = {
      ...place,
      id,
      lat: Number.isFinite(Number(place.lat)) ? Number(place.lat) : 0,
      lng: Number.isFinite(Number(place.lng)) ? Number(place.lng) : 0,
    }
  }

  function clear() {
    if (debounceTimer) clearTimeout(debounceTimer)
    searchSequence++
    query.value = ''
    results.value = []
    selected.value = null
  }

  const refresh = () => searchPlaces(query.value)

  return {
    query,
    results,
    selected,
    isSearching,
    select,
    clear,
    debug,
    refresh,
  }
}

function normalizeLocation(
  value: PlaceSearchLocation | null | undefined
): PlaceSearchLocation | null {
  if (!value) return null
  const lat = Number(value.lat)
  const lng = Number(value.lng)
  const radiusMeters = Number(value.radiusMeters)
  return Number.isFinite(lat) &&
    Number.isFinite(lng) &&
    Number.isFinite(radiusMeters) &&
    lat >= -90 &&
    lat <= 90 &&
    lng >= -180 &&
    lng <= 180 &&
    radiusMeters > 0 &&
    radiusMeters <= 50_000
    ? { lat, lng, radiusMeters }
    : null
}

function locationFromResults(
  results: PlaceSearchCell[]
): PlaceSearchLocation | null {
  for (const result of results) {
    const lat = Number(result.lat)
    const lng = Number(result.lng)
    if (
      Number.isFinite(lat) &&
      Number.isFinite(lng) &&
      lat >= -90 &&
      lat <= 90 &&
      lng >= -180 &&
      lng <= 180 &&
      (lat !== 0 || lng !== 0)
    ) {
      return { lat, lng, radiusMeters: 25_000 }
    }
  }
  return null
}

export type PlaceSearchCell = {
  id: string
  name: string
  shortName: string
  formattedAddress: string
  shortAddress: string
  imageUrl: string
  imageShade?: PlaceImageShade
  source?: PlaceSearchSource
  claimedBy?: string
  collection?: string
  lat?: number
  lng?: number
}
