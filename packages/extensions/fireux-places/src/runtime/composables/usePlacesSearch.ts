import { useFirestoreSearch } from '#imports'
import { computed, ref, watch, type ComputedRef, type Ref } from 'vue'
import type { BasePlace, Place, PlaceCard } from '../models/place.model'
import { canonicalPlaceId, fetchGoogle } from './usePlacesGoogle'

export interface UsePlacesSearchResult {
  searchPlaces: (query: string) => Promise<PlaceCard.Cell[]>
}

export interface PlacesSearchViewModel {
  query: Ref<string>
  results: Ref<PlaceCard.Cell[]>
  selected: Ref<BasePlace | null>
  isSearching: Ref<boolean>
  showEmpty: ComputedRef<boolean>
  select: (cell: PlaceCard.Cell) => void
  clear: () => void
}

export const PLACES_SEARCH_SHORTLIST_LIMIT = 4

const MIN_FIRESTORE_RESULTS_BEFORE_SUPPLEMENT = 4
const MAX_RESULTS = 10
const MIN_QUERY_LENGTH = 3

const toFirestoreCell = (p: Place): PlaceCard.Cell => ({
  place_id: canonicalPlaceId(p.place_id),
  name: p.name,
  avatar: p.avatar ?? null,
  formatted_address: p.formatted_address,
  source: 'firestore',
})

const norm = (v: string) =>
  v
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim()

export function usePlacesSearch(): UsePlacesSearchResult {
  const { prefixSearch } = useFirestoreSearch()

  async function searchPlaces(query: string): Promise<PlaceCard.Cell[]> {
    const q = norm(query)
    if (q.length < MIN_QUERY_LENGTH) return []

    const fxDocs = await prefixSearch<Place>({
      collection: 'places',
      field: 'search_term',
      query: q,
      limit: MAX_RESULTS,
    })
    const fxCells = fxDocs.map(toFirestoreCell)
    if (fxCells.length >= MIN_FIRESTORE_RESULTS_BEFORE_SUPPLEMENT) {
      return fxCells.slice(0, MAX_RESULTS)
    }

    const exclude = new Set(fxCells.map((c) => canonicalPlaceId(c.place_id)))
    const need = Math.max(
      0,
      MIN_FIRESTORE_RESULTS_BEFORE_SUPPLEMENT - fxCells.length
    )
    const googleCells = await fetchGoogle(query, exclude, need)

    const combined = [...fxCells, ...googleCells].filter(
      (cell, idx, arr) =>
        arr.findIndex(
          (candidate) =>
            canonicalPlaceId(candidate.place_id) ===
            canonicalPlaceId(cell.place_id)
        ) === idx
    )

    return combined.slice(0, MAX_RESULTS)
  }

  return { searchPlaces }
}

export function usePlacesSearchVm(): PlacesSearchViewModel {
  const { searchPlaces } = usePlacesSearch()

  const queryRef = ref('')
  const resultsRef = ref<PlaceCard.Cell[]>([])
  const selectedRef = ref<BasePlace | null>(null)
  const isSearchingRef = ref(false)

  const trimmedQuery = computed(() => queryRef.value.trim())
  const showEmpty = computed(
    () =>
      !isSearchingRef.value &&
      !selectedRef.value &&
      trimmedQuery.value.length >= MIN_QUERY_LENGTH &&
      resultsRef.value.length === 0
  )

  let searchToken = 0

  watch(
    queryRef,
    async (value) => {
      const term = value.trim()
      selectedRef.value = null

      if (term.length < MIN_QUERY_LENGTH) {
        resultsRef.value = []
        isSearchingRef.value = false
        return
      }

      const token = ++searchToken
      isSearchingRef.value = true

      try {
        const next = await searchPlaces(term)
        if (token === searchToken) {
          resultsRef.value = next
        }
      } finally {
        if (token === searchToken) {
          isSearchingRef.value = false
        }
      }
    },
    { immediate: true }
  )

  function clear() {
    selectedRef.value = null
  }

  function select(cell: PlaceCard.Cell) {
    selectedRef.value = {
      place_id: canonicalPlaceId(cell.place_id),
      formatted_address: cell.formatted_address ?? '',
      lat: 0,
      lng: 0,
      source: cell.source,
      avatar: cell.avatar ?? null,
      name: cell.name,
    }
  }

  return {
    query: queryRef,
    results: resultsRef,
    selected: selectedRef,
    isSearching: isSearchingRef,
    showEmpty,
    select,
    clear,
  }
}
