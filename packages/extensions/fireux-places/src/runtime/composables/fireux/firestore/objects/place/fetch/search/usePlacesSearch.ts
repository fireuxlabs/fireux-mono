import { useFirestoreSearch } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreSearch'
import { ref, watch } from 'vue'
import { useFirestore } from 'vuefire'
import type { BasePlace } from '../../../../../../../models/objects/place.model'
import { mapPlaceToBasePlace } from '../../utils/view/mapPlaceToBasePlace'
import type { PlaceCard } from '../../utils/view/usePlacesInterface'
import { usePlacesInterface } from '../../utils/view/usePlacesInterface'
import { canonicalPlaceId } from '../google/usePlacesGoogle'
import { normalizeQuery } from './normalizeQuery'
import { searchFirestorePrimary } from './searchFirestorePrimary'
import { searchGoogle } from './searchGoogle'

type UsePlacesSearchOptions = {
  debugLabel?: string
  type?: string | null
}

export function usePlacesSearch(options: UsePlacesSearchOptions = {}) {
  const { prefixSearch } = useFirestoreSearch()
  const db = useFirestore()
  const collectionName = 'places'

  const query = ref('')
  const results = ref<PlaceCard.Card[]>([])
  const selected = ref<BasePlace | null>(null)
  const isSearching = ref(false)

  const debug = ref<Record<string, unknown> | null>(null)

  const mapToBasePlace = mapPlaceToBasePlace()
  const { card: toCard } = usePlacesInterface()

  const toCardWithExtras = (base: any): PlaceCard.Card | null => {
    const mapped = toCard(base)
    if (!mapped) return null
    const lat = Number((base as any)?.lat)
    const lng = Number((base as any)?.lng)
    return {
      ...mapped,
      collection: (base as any)?.collection ?? mapped.collection,
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
      let primaryResults: PlaceCard.Card[] = []
      let primaryDebug: Record<string, unknown> | null = null

      // 1) Firestore (primary)
      try {
        const primary = await searchFirestorePrimary({
          prefixSearch,
          collectionName,
          term,
          termNormalized,
          mapToCard: mapToBasePlace,
        })
        if (primary) {
          primaryResults = primary.results
            .map((row) => toCardWithExtras(row))
            .filter(Boolean) as PlaceCard.Card[]
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

      // 2) Google autocomplete (always supplement)
      const google = await searchGoogle({
        term,
        allowGoogle: true,
        collectionName,
        db,
        mapToCard: mapToBasePlace,
        type: options.type ?? null,
      })

      const googleCards = google.results
        .map((row) => toCardWithExtras(row))
        .filter(Boolean) as PlaceCard.Card[]

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

  function select(cell: PlaceCard.Card) {
    const id = canonicalPlaceId(cell.id) || cell.id
    const cellLat = Number((cell as any)?.lat)
    const cellLng = Number((cell as any)?.lng)
    const lat = Number.isFinite(cellLat) ? cellLat : undefined
    const lng = Number.isFinite(cellLng) ? cellLng : undefined
    selected.value = {
      id,
      name: cell.name,
      short_name: (cell as any).shortName || (cell as any).short_name || '',
      formatted_address: cell.formattedAddress || '',
      short_address: cell.shortAddress || '',
      ...(typeof lat === 'number' ? { lat } : {}),
      ...(typeof lng === 'number' ? { lng } : {}),
      source: cell.source as any,
      image_url: cell.imageUrl || '',
      claimed_by: cell.claimedBy || '',
      collection: cell.collection,
    } as any
  }

  function clear() {
    query.value = ''
    results.value = []
    selected.value = null
  }

  return { query, results, selected, isSearching, select, clear, debug }
}

