import type { Place, PlaceCard } from '../models/place.model'
import { useFirestoreSearch } from '#fireux-core-composables/firestore/useFirestoreSearch'
import { fetchGoogle } from './usePlacesGoogle'

export interface UsePlacesSearchResult {
  searchPlaces: (query: string) => Promise<PlaceCard.Cell[]>
}

const MIN_FIRESTORE_RESULTS_BEFORE_SUPPLEMENT = 4
const MAX_RESULTS = 10

const canonicalPlaceId = (id?: string | null) =>
  (id ?? '').trim().replace(/^"+/, '').replace(/"+$/, '')

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
    if (!q) return []

    // 1) Firestore “starts with” search on `search_term`
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

    // 2) Google supplement to reach minimum
    const exclude = new Set(fxCells.map((c) => canonicalPlaceId(c.place_id)))
    const need = Math.max(
      0,
      MIN_FIRESTORE_RESULTS_BEFORE_SUPPLEMENT - fxCells.length
    )
    const googleCells = await fetchGoogle(query, exclude, need)

    // 3) Combine + dedupe + cap
    const combined = [...fxCells, ...googleCells].filter(
      (c, i, arr) =>
        arr.findIndex(
          (x) => canonicalPlaceId(x.place_id) === canonicalPlaceId(c.place_id)
        ) === i
    )

    return combined.slice(0, MAX_RESULTS)
  }

  return { searchPlaces }
}
