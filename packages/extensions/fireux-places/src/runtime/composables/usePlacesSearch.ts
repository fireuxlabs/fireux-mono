/* eslint-disable no-console */
import { ref, watch } from 'vue'
import type { Ref } from 'vue'
import type { BasePlace, PlaceCard } from '../models/place.model'
import { useFirestoreSearch } from '#fireux-core-composables/firestore/useFirestoreSearch'
import {
  canonicalPlaceId,
  fetchGoogle,
  fetchPlaceDetails,
  type PlaceDetailsResult,
} from './usePlacesGoogle'

/**
 * usePlacesSearch()
 * Unified composable:
 * - Firestore prefix search first
 * - Falls back to Google Autocomplete
 * - Hydrates selected Google result via Details API
 */
export function usePlacesSearch() {
  const { prefixSearch } = useFirestoreSearch()

  // ── State
  const query = ref('')
  const results = ref<PlaceCard.Cell[]>([])
  const selected = ref<BasePlace | null>(null)
  const isSearching = ref(false)

  // ── Core search
  async function searchPlaces(q: string) {
    const term = q.trim().toLowerCase()
    if (!term) {
      results.value = []
      return
    }

    isSearching.value = true
    try {
      // Firestore first
      const hits = await prefixSearch<{
        place_id: string
        name: string
        formatted_address?: string
        avatar?: string | null
        search_term: string
      }>({
        collection: 'places',
        field: 'search_term',
        query: term,
        limit: 5,
      })

      if (hits.length > 0) {
        results.value = hits.map((p) => ({
          place_id: p.place_id,
          name: p.name,
          formatted_address: p.formatted_address ?? undefined,
          source: 'firestore',
          avatar: p.avatar ?? null,
        }))
        return
      }

      // Google fallback
      console.log('[places][search] 🔄 No Firestore hits, using Google…')
      const googleCells = await fetchGoogle(term, new Set(), 4)
      results.value = googleCells
    } catch (err) {
      console.warn('[places][search] ❌ failed:', err)
      results.value = []
    } finally {
      isSearching.value = false
    }
  }

  watch(query, (q) => void searchPlaces(q))

  // ── Select & hydrate
  async function select(cell: PlaceCard.Cell) {
    console.log('[places][select]', cell)

    // Immediate visual feedback
    selected.value = {
      place_id: cell.place_id,
      name: cell.name,
      formatted_address: cell.formatted_address ?? '',
      lat: 0,
      lng: 0,
      source: cell.source,
      avatar: cell.avatar ?? null,
    }

    // Hydrate Google result
    if (cell.source === 'google' && typeof window !== 'undefined') {
      try {
        const details: PlaceDetailsResult | null = await fetchPlaceDetails(
          cell.place_id
        )
        if (!details) return

        const g = details.google
        selected.value = {
          place_id: g.place_id,
          name: g.name,
          formatted_address: g.formatted_address,
          lat: g.lat,
          lng: g.lng,
          source: 'google',
          avatar: g.avatar,
        }

        console.log('[places][details] hydrated:', selected.value)
      } catch (err) {
        console.warn('[places][details] hydration failed:', err)
      }
    }
  }

  // ── Reset
  function clear() {
    query.value = ''
    results.value = []
    selected.value = null
  }

  return { query, results, selected, isSearching, select, clear }
}
