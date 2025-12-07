import { ref, watch } from 'vue'
import type { BasePlace, PlaceCard } from '../models/place.model'
import { useFirestoreSearch } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreSearch.ts'
import {
  canonicalPlaceId,
  fetchGoogle,
  fetchPlaceDetails,
  type PlaceDetailsResult,
} from './usePlacesGoogle'

const sanitize = (url?: string | null) =>
  url && !/mapfiles\/place_api\/icons/i.test(url) ? url : null

// in-memory cache for logos by place_id
const logoCache = new Map<string, string | null>()
const pendingLogos = new Map<string, Promise<string | null>>()

async function resolveLogo(
  details: PlaceDetailsResult
): Promise<string | null> {
  if (!globalThis.window) {
    return null
  }

  const params = new URLSearchParams()
  if (details.google.website) {
    params.set('website', details.google.website)
  } else if (details.raw?.url) {
    try {
      params.set('domain', new URL(details.raw.url).hostname)
    } catch {
      /* ignore */
    }
  } else {
    params.set('q', details.google.name || 'place')
  }

  try {
    const origin = globalThis.window.location.origin
    const url = new URL('/api/places/logo', origin)
    url.search = params.toString()
    const res = await fetch(url.toString(), {
      headers: { accept: 'application/json' },
    })
    if (!res.ok) return null
    const { url: candidate } = (await res.json()) as { url?: string | null }
    return sanitize(candidate ?? null)
  } catch (e) {
    console.debug('[places][logo] detector failed', e)
    return null
  }
}

export function usePlacesSearch() {
  const { prefixSearch } = useFirestoreSearch()

  const query = ref('')
  const results = ref<PlaceCard.Cell[]>([])
  const selected = ref<BasePlace | null>(null)
  const isSearching = ref(false)

  async function searchPlaces(q: string) {
    const term = q.trim().toLowerCase()
    if (!term) {
      results.value = []
      return
    }

    isSearching.value = true
    try {
      // firestore first
      const fx = await prefixSearch<{
        place_id: string
        name: string
        formatted_address?: string
        avatar?: string | null
        search_term: string
      }>({ collection: 'places', field: 'search_term', query: term, limit: 5 })

      if (fx.length) {
        results.value = fx.map<PlaceCard.Cell>((p: {
          place_id: string
          name: string
          formatted_address?: string
          avatar?: string | null
        }) => ({
          place_id: p.place_id,
          name: p.name,
          formatted_address: p.formatted_address ?? undefined,
          source: 'firestore',
          avatar: p.avatar ?? null,
        }))
        return
      }

      if (term.length < 3) {
        results.value = []
        return
      }

      // google fallback (no avatars yet)
      results.value = await fetchGoogle(term, new Set(), 4)
    } catch (e) {
      console.warn('[places][search] failed', e)
      results.value = []
    } finally {
      isSearching.value = false
    }
  }

  watch(query, (q) => void searchPlaces(q))

  // 🔎 whenever shortlist changes, lazily hydrate missing Google logos
  watch(
    results,
    (cells) => {
      if (!globalThis.window) {
        return
      }

      const googleCells = cells.filter((c) => c.source === 'google').slice(0, 6)

      for (const cell of googleCells) {
        const id = canonicalPlaceId(cell.place_id)
        if (!id) continue
        if (logoCache.has(id) || pendingLogos.has(id)) continue

        const job = (async () => {
          try {
            const details = await fetchPlaceDetails(id)
            if (!details) {
              logoCache.set(id, null)
              return null
            }

            const url = await resolveLogo(details)
            logoCache.set(id, url ?? null)

            const idx = results.value.findIndex(
              (row) => canonicalPlaceId(row.place_id) === id
            )
            if (idx !== -1) {
              const current = results.value[idx]
              if ((current.avatar ?? null) == null) {
                results.value.splice(idx, 1, {
                  ...current,
                  avatar: url ?? null,
                })
              }
            }

            if (
              selected.value &&
              canonicalPlaceId(selected.value.place_id) === id &&
              (selected.value.avatar ?? null) == null
            ) {
              selected.value = { ...selected.value, avatar: url ?? null }
            }

            return url ?? null
          } catch {
            logoCache.set(id, null)
            return null
          } finally {
            pendingLogos.delete(id)
          }
        })()

        pendingLogos.set(id, job)
      }
    },
    { immediate: false }
  )

  // select reuses cached logo; never clobbers an existing non-null avatar
  async function select(cell: PlaceCard.Cell) {
    const id = canonicalPlaceId(cell.place_id) || cell.place_id
    const cached = logoCache.get(id) ?? null

    selected.value = {
      place_id: id,
      name: cell.name,
      formatted_address: cell.formatted_address ?? '',
      lat: 0,
      lng: 0,
      source: cell.source,
      avatar: cell.avatar ?? cached ?? null,
    }

    // enrich from details (lat/lng, but keep avatar if we already have one)
    if (cell.source === 'google' && globalThis.window) {
      try {
        const details = await fetchPlaceDetails(id)
        if (!details) return

        const better = logoCache.get(id) ?? null
        const cur = selected.value
        if (cur && canonicalPlaceId(cur.place_id) === id) {
          selected.value = {
            ...cur,
            name: details.google.name,
            formatted_address: details.google.formatted_address,
            lat: details.google.lat,
            lng: details.google.lng,
            avatar: cur.avatar ?? better ?? null, // don’t overwrite a non-null
          }
        }
      } catch (e) {
        console.debug('[places][details] skip', e)
      }
    }
  }

  function clear() {
    query.value = ''
    results.value = []
    selected.value = null
  }

  return { query, results, selected, isSearching, select, clear }
}
