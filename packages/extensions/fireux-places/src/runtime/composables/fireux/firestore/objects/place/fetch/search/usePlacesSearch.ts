import { useFirestoreRead } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreRead'
import { useFirestoreSearch } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreSearch'
import { ref, watch } from 'vue'
import type { BasePlace } from '../../../../../../../models/objects/place.model'
import type { PlaceCard } from '../../utils/view/usePlacesInterface'
import {
  canonicalPlaceId,
  fetchGoogle,
  fetchPlaceDetails,
  getLastPlacesAutocompleteDebug,
  type PlaceDetailsResult,
} from '../google/usePlacesGoogle'

const sanitize = (url?: string | null) =>
  url && !/mapfiles\/place_api\/icons/i.test(url) ? url : null

type PlaceSearchRow = {
  id?: string
  place_id?: string
  name: string
  formatted_address?: string
  place_image?: string | null
  image_url?: string | null
  search_term: string
  search_term_normalized?: string
  source?: string
  claimed_by?: string
}

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

export function usePlacesSearch(options?: {
  type?: string | null
  collection?: string
  normalizedField?: keyof PlaceSearchRow & string
  localFallback?: boolean
  extraCollections?: string[]
  allowGoogle?: boolean
}) {
  const { prefixSearch } = useFirestoreSearch()
  const { firestoreFetchCollection } = useFirestoreRead()

  const collectionName = options?.collection || 'places'
  const extraCollections = options?.extraCollections ?? []
  const allowGoogle = options?.allowGoogle ?? collectionName === 'places'
  const localCollection = options?.localFallback
    ? firestoreFetchCollection<Record<string, any>>(collectionName)
    : null
  const extraLocalCollections = options?.localFallback
    ? extraCollections.map((name) => ({
        name,
        data: firestoreFetchCollection<Record<string, any>>(name),
      }))
    : []

  const query = ref('')
  const results = ref<PlaceCard.Card[]>([])
  const selected = ref<BasePlace | null>(null)
  const isSearching = ref(false)

  const debug = ref<Record<string, unknown> | null>(null)

  async function searchPlaces(q: string) {
    const term = q.trim().toLowerCase()
    const termNormalized = term
      ? term.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      : ''
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

    const mapToCard = (p: any, collectionOverride?: string): PlaceCard.Card => {
      const id = canonicalPlaceId(p?.place_id ?? p?.id) ?? ''
      const sourceRaw = typeof p?.source === 'string' ? p.source : 'fireux'
      const safeSource =
        sourceRaw === 'google'
          ? 'google'
          : sourceRaw === 'manual'
            ? 'manual'
            : 'fireux'

      const placeImageRaw = p?.place_image ?? p?.image_url
      const place_image = typeof placeImageRaw === 'string' ? placeImageRaw : ''
      const formattedAddress =
        typeof p?.formatted_address === 'string' ? p.formatted_address : ''

      return {
        id,
        to: `/places/${encodeURIComponent(id)}`,

        avatarUrl: place_image,
        title: String(p?.name ?? ''),
        subtitle: formattedAddress,
        badges: [],

        name: String(p?.name ?? ''),
        formattedAddress,

        imageUrl: place_image,
        source: safeSource as any,

        collection: collectionOverride ?? p?.collection ?? undefined,

        claimedBy: typeof p?.claimed_by === 'string' ? p.claimed_by : '',
      }
    }

    isSearching.value = true
    try {
      let firestoreFailed = false
      let firestoreError: unknown = null
      let fx: PlaceSearchRow[] = []

      try {
        fx = await prefixSearch<PlaceSearchRow>({
          collection: collectionName,
          field: 'search_term',
          query: term,
          limit: 5,
        })

        if (!fx.length && termNormalized && termNormalized !== term && options?.normalizedField) {
          fx = await prefixSearch<PlaceSearchRow>({
            collection: collectionName,
            field: options.normalizedField as keyof PlaceSearchRow & string,
            query: termNormalized,
            limit: 5,
          })
        }
      } catch (err) {
        firestoreFailed = true
        firestoreError = err
        if (import.meta.dev) {
          console.warn('[places][search] firestore prefixSearch failed', err)
        }
      }

      if (fx.length) {
        results.value = fx.map((row) => mapToCard(row, collectionName))
        if (import.meta.dev) {
          debug.value = {
            term,
            termNormalized,
            stage: 'firebase',
            field:
              fx.length && options?.normalizedField && termNormalized !== term
                ? options.normalizedField
                : 'search_term',
            firestoreCount: fx.length,
            firestoreCollections: [collectionName],
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

      if (extraCollections.length) {
        let extraHits: Array<{ row: PlaceSearchRow; collection: string }> = []
        for (const extra of extraCollections) {
          try {
            const rows = await prefixSearch<PlaceSearchRow>({
              collection: extra,
              field: 'search_term',
              query: term,
              limit: 5,
            })
            extraHits = extraHits.concat(
              rows.map((row) => ({ row, collection: extra }))
            )

            if (
              !rows.length &&
              termNormalized &&
              termNormalized !== term &&
              options?.normalizedField
            ) {
              const normalizedRows = await prefixSearch<PlaceSearchRow>({
                collection: extra,
                field: options.normalizedField as keyof PlaceSearchRow & string,
                query: termNormalized,
                limit: 5,
              })
              extraHits = extraHits.concat(
                normalizedRows.map((row) => ({ row, collection: extra }))
              )
            }
          } catch (err) {
            if (import.meta.dev) {
              console.warn('[places][search] extra collection failed', extra, err)
            }
          }
        }

        if (extraHits.length) {
          results.value = extraHits.map(({ row, collection }) =>
            mapToCard(row, collection)
          )
          if (import.meta.dev) {
            debug.value = {
              term,
              termNormalized,
              stage: 'firebase-extra',
              firestoreCount: extraHits.length,
              firestoreCollections: [collectionName, ...extraCollections],
              googleAttempted: false,
            }
          }
          return
        }
      }

      if (options?.localFallback) {
        const normalizedQuery = termNormalized || term
        const filtered = (localCollection?.value ?? [])
          .filter((row) => {
            const raw = `${row?.name ?? ''} ${row?.formatted_address ?? ''} ${row?.search_term ?? ''} ${row?.id ?? ''}`
            const normalized = raw
              .toLowerCase()
              .normalize('NFD')
              .replace(/[\u0300-\u036f]/g, '')
            return normalized.includes(normalizedQuery)
          })
          .slice(0, 5)

        let extraFiltered: any[] = []
        if (extraLocalCollections.length) {
          for (const extra of extraLocalCollections) {
            const rows = (extra.data.value ?? [])
              .filter((row) => {
                const raw = `${row?.name ?? ''} ${row?.formatted_address ?? ''} ${row?.search_term ?? ''} ${row?.id ?? ''}`
                const normalized = raw
                  .toLowerCase()
                  .normalize('NFD')
                  .replace(/[\u0300-\u036f]/g, '')
                return normalized.includes(normalizedQuery)
              })
              .slice(0, 5)
            extraFiltered = extraFiltered.concat(rows)
          }
        }

        const mergedFiltered = filtered.length ? filtered : extraFiltered
        if (mergedFiltered.length) {
          results.value = mergedFiltered.map((row) =>
            mapToCard(row, collectionName)
          )
          if (import.meta.dev) {
            debug.value = {
              term,
              termNormalized,
              stage: 'local',
              localCount: mergedFiltered.length,
              firestoreCount: 0,
              firestoreCollections: [collectionName, ...extraCollections],
              googleAttempted: false,
            }
          }
          return
        }
      }

      if (!allowGoogle) {
        results.value = []
        if (import.meta.dev) {
          debug.value = {
            term,
            termNormalized,
            stage: 'skip_google_collection',
            firestoreCount: 0,
            localCount: (localCollection?.value ?? []).length,
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
            termNormalized,
            stage: 'skip_google_term_too_short',
            firestoreCount: 0,
            googleAttempted: false,
          }
        }
        return
      }

      results.value = await fetchGoogle(term, new Set(), 4, {
        type: options?.type ?? null,
      })

      if (import.meta.dev) {
        debug.value = {
          term,
          termNormalized,
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
          termNormalized,
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
    (cells: PlaceCard.Card[]) => {
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
              (row: PlaceCard.Card) => canonicalPlaceId(row.id) === id
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
              selected.value = {
                ...(selected.value as any),
                place_image: nextImageUrl ?? '',
              } as any
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

  // select reuses cached logo; never clobbers an existing non-null place_image
  async function select(cell: PlaceCard.Card) {
    const id = canonicalPlaceId(cell.id) || cell.id
    const cached = logoCache.get(id) ?? null

    selected.value = {
      id,
      name: cell.name,
      formatted_address: cell.formattedAddress || '',
      lat: 0,
      lng: 0,
      source: cell.source,
      place_image: cell.imageUrl || cached || '',
      claimed_by: cell.claimedBy || '',
      collection: cell.collection,
    } as any

    // enrich from details (lat/lng, but keep place_image if we already have one)
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

