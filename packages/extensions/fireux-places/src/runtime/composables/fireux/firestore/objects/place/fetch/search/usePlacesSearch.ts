import { useFirestoreSearch } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreSearch'
import { ref, watch } from 'vue'
import { useFirestore } from 'vuefire'
import type { BasePlace } from '../../../../../../../models/objects/place.model'
import { mapPlaceToCard } from '../../utils/view/mapPlaceToCard'
import type { PlaceCard } from '../../utils/view/usePlacesInterface'
import { canonicalPlaceId } from '../google/usePlacesGoogle'
import { normalizeQuery } from './normalizeQuery'
import { searchFirestorePrimary } from './searchFirestorePrimary'
import { searchGoogle } from './searchGoogle'
export function usePlacesSearch() {
  const { prefixSearch } = useFirestoreSearch()
  const db = useFirestore()
  const collectionName = 'places'

  const query = ref('')
  const results = ref<PlaceCard.Card[]>([])
  const selected = ref<BasePlace | null>(null)
  const isSearching = ref(false)

  const debug = ref<Record<string, unknown> | null>(null)

  const mapToCard = mapPlaceToCard()

  async function searchPlaces(q: string) {
    const term = q.trim().toLowerCase()
    const termNormalized = term ? normalizeQuery(term) : ''

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
          mapToCard,
        })
        if (primary) {
          primaryResults = primary.results
          primaryDebug = primary.debug ?? null
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
        mapToCard,
      })

      if (primaryResults.length) {
        const existingIds = new Set(
          primaryResults.map((r) => canonicalPlaceId(r.id) || r.id)
        )
        const additions = google.results.filter(
          (r) => !existingIds.has(canonicalPlaceId(r.id) || r.id)
        )
        results.value = [...primaryResults, ...additions]
      } else {
        results.value = google.results
      }

      if (import.meta.dev) {
        debug.value = {
          primary: primaryDebug,
          google: google.debug ?? null,
        }
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
      formatted_address: cell.formattedAddress || '',
      ...(typeof lat === 'number' ? { lat } : {}),
      ...(typeof lng === 'number' ? { lng } : {}),
      source: cell.source as any,
      place_image: cell.imageUrl || '',
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

