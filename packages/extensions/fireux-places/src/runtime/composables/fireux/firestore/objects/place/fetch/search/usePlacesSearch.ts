import { ref, watch } from 'vue'
import type { BasePlace } from '../../../../../../../models/place.model'
import type { PlaceCard } from '../../utils/view/usePlacesInterface'
import { useFirestoreSearch } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreSearch'
import {
  canonicalPlaceId,
  fetchGoogle,
  fetchPlaceDetails,
  getLastPlacesAutocompleteDebug,
  type PlaceDetailsResult,
} from '../google/usePlacesGoogle'

const sanitize = (url?: string | null) =>
  url && !/mapfiles\/place_api\/icons/i.test(url) ? url : null

// in-memory cache for logos by id
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

export function usePlacesSearch(options?: { type?: string | null }) {
  const { prefixSearch } = useFirestoreSearch()

  const query = ref('')
  const results = ref<PlaceCard.Cell[]>([])
  const selected = ref<BasePlace | null>(null)
  const isSearching = ref(false)

  const debug = ref<Record<string, unknown> | null>(null)

  async function searchPlaces(q: string) {
    const term = q.trim().toLowerCase()
    if (!term) {
      results.value = []
      if (import.meta.dev) {
        debug.value = {
          term: null,
          stage: 'idle',
        }
      }
      return
    }

    isSearching.value = true
    try {
      // firestore first (but don't block google fallback if firestore fails)
      let firestoreFailed = false
      let firestoreError: unknown = null
      let fx: Array<{
        id?: string
        place_id?: string
        name: string
        formatted_address?: string
        place_image?: string | null
        image_url?: string | null
        avatar?: string | null
        search_term: string
        source?: string
      }> = []

      try {
        fx = await prefixSearch<{
          id?: string
          place_id?: string
          name: string
          formatted_address?: string
          place_image?: string | null
          image_url?: string | null
          avatar?: string | null
          search_term: string
          source?: string
        }>({ collection: 'places', field: 'search_term', query: term, limit: 5 })
      } catch (err) {
        firestoreFailed = true
        firestoreError = err
        if (import.meta.dev) {
          console.warn('[places][search] firestore prefixSearch failed', err)
        }
      }

      if (fx.length) {
        results.value = fx.map<PlaceCard.Cell>((p: any) => {
          const id = canonicalPlaceId(p?.place_id ?? p?.id) ?? ''
          const sourceRaw = typeof p?.source === 'string' ? p.source : 'firebase'
          const normalizedSource = sourceRaw === 'firestore' ? 'firebase' : sourceRaw
          const safeSource = normalizedSource === 'google' ? 'google' : 'firebase'

          const placeImageRaw = p?.place_image ?? p?.image_url ?? p?.avatar
          const place_image = typeof placeImageRaw === 'string' ? placeImageRaw : ''

          return {
            id,
            name: String(p?.name ?? ''),
            formatted_address:
              typeof p?.formatted_address === 'string'
                ? p.formatted_address
                : '',
            source: safeSource as any,
            imageUrl: place_image,
          }
        })

        if (import.meta.dev) {
          debug.value = {
            term,
            stage: 'firebase',
            firestoreCount: fx.length,
            firestoreFailed,
            firestoreError:
              firestoreFailed && firestoreError
                ? firestoreError instanceof Error
                  ? firestoreError.message
                  : String(firestoreError)
                : null,
            googleAttempted: false,
          }
        }
        return
      }

      if (term.length < 4) {
        results.value = []
        if (import.meta.dev) {
          debug.value = {
            term,
            stage: 'skip_google_term_too_short',
            firestoreCount: 0,
            googleAttempted: false,
          }
        }
        return
      }

      // google fallback (no avatars yet)
      results.value = await fetchGoogle(term, new Set(), 4, {
        type: options?.type ?? null,
      })

      if (import.meta.dev) {
        debug.value = {
          term,
          stage: 'google',
          firestoreCount: 0,
          firestoreFailed,
          firestoreError:
            firestoreFailed && firestoreError
              ? firestoreError instanceof Error
                ? firestoreError.message
                : String(firestoreError)
              : null,
          googleAttempted: true,
          googleCount: results.value.length,
          google: getLastPlacesAutocompleteDebug(),
        }
      }
    } catch (e) {
      console.warn('[places][search] failed', e)
      results.value = []

      if (import.meta.dev) {
        debug.value = {
          term,
          stage: 'error',
          error: e instanceof Error ? e.message : String(e),
          google: getLastPlacesAutocompleteDebug(),
        }
      }
    } finally {
      isSearching.value = false
    }
  }

  watch(query, (q: string) => void searchPlaces(q))

  // 🔎 whenever shortlist changes, lazily hydrate missing Google logos
  watch(
    results,
    (cells: PlaceCard.Cell[]) => {
      if (!globalThis.window) {
        return
      }

      const googleCells = cells.filter((c) => c.source === 'google').slice(0, 6)

      for (const cell of googleCells) {
        const id = canonicalPlaceId(cell.id)
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
            const fallbackIcon = details.google.place_image || null
            const nextImageUrl = url ?? fallbackIcon ?? null
            logoCache.set(id, nextImageUrl)

            const idx = results.value.findIndex(
              (row: PlaceCard.Cell) => canonicalPlaceId(row.id) === id
            )
            if (idx !== -1) {
              const current = results.value[idx]
              if (!current.imageUrl) {
                results.value.splice(idx, 1, {
                  ...current,
                  imageUrl: nextImageUrl ?? '',
                })
              }
            }

            if (
              selected.value &&
              canonicalPlaceId((selected.value as any).place_id ?? selected.value.id) === id &&
              !(selected.value as any).place_image
            ) {
              selected.value = { ...selected.value, place_image: nextImageUrl ?? '' }
            }

            return nextImageUrl
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
    const id = canonicalPlaceId(cell.id) || cell.id
    const cached = logoCache.get(id) ?? null

    selected.value = {
      id,
      name: cell.name,
      formatted_address: cell.formatted_address || '',
      lat: 0,
      lng: 0,
      source: cell.source,
      place_image: cell.imageUrl || cached || '',
    }

    // enrich from details (lat/lng, but keep avatar if we already have one)
    if (cell.source === 'google' && globalThis.window) {
      try {
        const details = await fetchPlaceDetails(id)
        if (!details) return

        const better = logoCache.get(id) ?? null
        const cur = selected.value
        const curId = cur ? canonicalPlaceId((cur as any).place_id ?? cur.id) : null
        if (cur && curId === id) {
          selected.value = {
            ...cur,
            name: details.google.name,
            formatted_address: details.google.formatted_address,
            lat: details.google.lat,
            lng: details.google.lng,
            place_image:
              (cur as any).place_image || better || details.google.place_image || '',
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

  return { query, results, selected, isSearching, select, clear, debug }
}

