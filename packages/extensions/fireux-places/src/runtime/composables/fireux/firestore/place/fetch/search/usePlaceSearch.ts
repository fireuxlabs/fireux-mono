// Concurrent edit — 2026-07-21 14:30 CEST — Place public projection: search projected Places without browser Firestore access.
import { ref, watch } from 'vue'
import { type BasePlace, type PlaceImageShade, type PlaceSource } from '../../../../../../models/place.model'
import { mapPlaceToBasePlace } from '../../utils/view/mapPlaceToBasePlace'
import { canonicalPlaceId } from '../google/usePlacesGoogle'
import { normalizeQuery } from './normalizeQuery'
import { searchPublicPrimary } from './searchPublicPrimary'
import { searchGoogle } from './searchGoogle'

type UsePlaceSearchOptions = {
  debugLabel?: string
  type?: string | null
}

export function usePlaceSearch(options: UsePlaceSearchOptions = {}) {
  const query = ref('')
  const results = ref<PlaceSearchCell[]>([])
  const selected = ref<BasePlace | null>(null)
  const isSearching = ref(false)

  const debug = ref<Record<string, unknown> | null>(null)

  const mapToBasePlace = mapPlaceToBasePlace()

  const toSearchCell = (base: any): PlaceSearchCell | null => {
    if (!base) return null
    const id = String((base as any)?.id ?? '').trim()
    if (!id) return null
    const name = String((base as any)?.name ?? '').trim()
    const shortName = String((base as any)?.short_name ?? '').trim()
    const formattedAddress = String((base as any)?.formatted_address ?? '').trim()
    const shortAddress = String((base as any)?.short_address ?? '').trim()
    const imageUrl = String((base as any)?.image_url ?? '').trim()
    const imageShade = (base as any)?.image_shade as PlaceImageShade | undefined
    const source = (base as any)?.source as PlaceSource | undefined
    const claimedBy = String((base as any)?.claimed_by ?? '').trim()
    const collection = String((base as any)?.collection ?? '').trim() || undefined
    const lat = Number((base as any)?.lat)
    const lng = Number((base as any)?.lng)
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
        const primary = await searchPublicPrimary({
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

      const google = await searchGoogle({
        term,
        allowGoogle: true,
        mapToCard: mapToBasePlace,
        type: options.type ?? null,
      })

      const googleCards = google.results
        .map((row) => toSearchCell(row))
        .filter(Boolean) as PlaceSearchCell[]

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
      isSearching.value = false
    }
  }

  watch(query, (q: string) => void searchPlaces(q))

  function select(place: BasePlace) {
    const id = canonicalPlaceId(place.id) || place.id
    const lat = Number((place as any)?.lat)
    const lng = Number((place as any)?.lng)
    selected.value = {
      id,
      name: String((place as any)?.name ?? ''),
      short_name: String((place as any)?.short_name ?? ''),
      formatted_address: String((place as any)?.formatted_address ?? ''),
      short_address: String((place as any)?.short_address ?? ''),
      ...(Number.isFinite(lat) ? { lat } : {}),
      ...(Number.isFinite(lng) ? { lng } : {}),
      source: (place as any)?.source as any,
      image_url: String((place as any)?.image_url ?? ''),
      claimed_by: String((place as any)?.claimed_by ?? ''),
      collection: (place as any)?.collection,
    } as any
  }

  function clear() {
    query.value = ''
    results.value = []
    selected.value = null
  }

  return { query, results, selected, isSearching, select, clear, debug }
}

export type PlaceSearchCell = {
  id: string
  name: string
  shortName: string
  formattedAddress: string
  shortAddress: string
  imageUrl: string
  imageShade?: PlaceImageShade
  source?: PlaceSource
  claimedBy?: string
  collection?: string
  lat?: number
  lng?: number
}
