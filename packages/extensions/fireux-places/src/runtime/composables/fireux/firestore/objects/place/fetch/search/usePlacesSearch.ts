import { useFirestoreRead } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreRead'
import { useFirestoreSearch } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreSearch'
import { ref, watch } from 'vue'
import type { BasePlace } from '../../../../../../../models/objects/place.model'
import type { PlaceCard } from '../../utils/view/usePlacesInterface'
import {
  canonicalPlaceId,
  fetchGoogle,
  getLastPlacesAutocompleteDebug,
} from '../google/usePlacesGoogle'

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

  const normalize = (value: string) =>
    value
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim()

  const mapToCard = (p: any, collectionOverride?: string): PlaceCard.Card => {
    const id = canonicalPlaceId(p?.place_id ?? p?.id) ?? ''
    const sourceRaw = typeof p?.source === 'string' ? p.source : 'fireux'
    const source =
      sourceRaw === 'google' ? 'google' : sourceRaw === 'manual' ? 'manual' : 'fireux'

    const imgRaw = p?.place_image ?? p?.image_url
    const imageUrl = typeof imgRaw === 'string' ? imgRaw : ''
    const formattedAddress =
      typeof p?.formatted_address === 'string' ? p.formatted_address : ''

    return {
      id,
      to: `/places/${encodeURIComponent(id)}`,

      avatarUrl: imageUrl,
      title: String(p?.name ?? ''),
      subtitle: formattedAddress,
      badges: [],

      name: String(p?.name ?? ''),
      formattedAddress,

      imageUrl,
      source: source as any,

      collection: collectionOverride ?? p?.collection ?? undefined,
      claimedBy: typeof p?.claimed_by === 'string' ? p.claimed_by : '',
    }
  }

  async function searchPlaces(q: string) {
    const term = q.trim().toLowerCase()
    const termNormalized = term ? normalize(term) : ''

    if (!term) {
      results.value = []
      if (import.meta.dev) debug.value = { stage: 'idle' }
      return
    }

    isSearching.value = true
    try {
      // 1) Firestore (primary)
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
            field: options.normalizedField,
            query: termNormalized,
            limit: 5,
          })
        }
      } catch (err) {
        if (import.meta.dev) {
          debug.value = {
            stage: 'firestore-error',
            error: err instanceof Error ? err.message : String(err),
          }
        }
      }

      if (fx.length) {
        results.value = fx.map((row) => mapToCard(row, collectionName))
        if (import.meta.dev) debug.value = { stage: 'firebase', count: fx.length }
        return
      }

      // 2) Firestore (extra collections)
      if (extraCollections.length) {
        const hits: Array<{ row: PlaceSearchRow; collection: string }> = []

        for (const extra of extraCollections) {
          try {
            let rows = await prefixSearch<PlaceSearchRow>({
              collection: extra,
              field: 'search_term',
              query: term,
              limit: 5,
            })

            if (!rows.length && termNormalized && termNormalized !== term && options?.normalizedField) {
              rows = await prefixSearch<PlaceSearchRow>({
                collection: extra,
                field: options.normalizedField,
                query: termNormalized,
                limit: 5,
              })
            }

            hits.push(...rows.map((row) => ({ row, collection: extra })))
          } catch {
            // ignore extra collection failure
          }
        }

        if (hits.length) {
          results.value = hits.map(({ row, collection }) => mapToCard(row, collection))
          if (import.meta.dev) debug.value = { stage: 'firebase-extra', count: hits.length }
          return
        }
      }

      // 3) localFallback (if enabled)
      if (options?.localFallback) {
        const needle = termNormalized || term
        const filterLocal = (rows: any[]) =>
          rows
            .filter((row) => {
              const hay = normalize(
                `${row?.name ?? ''} ${row?.formatted_address ?? ''} ${row?.search_term ?? ''} ${row?.id ?? ''}`
              )
              return hay.includes(needle)
            })
            .slice(0, 5)

        const filteredPrimary = filterLocal(localCollection?.value ?? []).map((row) => ({
          row,
          collection: collectionName,
        }))
        const filteredExtra = extraLocalCollections.flatMap((extra) =>
          filterLocal(extra.data.value ?? []).map((row) => ({
            row,
            collection: extra.name,
          }))
        )

        const mergedLocal = filteredPrimary.length ? filteredPrimary : filteredExtra
        if (mergedLocal.length) {
          results.value = mergedLocal.map(({ row, collection }) =>
            mapToCard(row, collection)
          )
          if (import.meta.dev) debug.value = { stage: 'local', count: mergedLocal.length }
          return
        }
      }

      // 4) Google autocomplete (if allowed)
      if (!allowGoogle) {
        results.value = []
        if (import.meta.dev) debug.value = { stage: 'skip-google' }
        return
      }

      if (term.length < 4) {
        results.value = []
        if (import.meta.dev) debug.value = { stage: 'skip-google-too-short' }
        return
      }

      results.value = await fetchGoogle(term, new Set(), 4, { type: options?.type ?? null })
      if (import.meta.dev) {
        debug.value = {
          stage: 'google',
          count: results.value.length,
          google: getLastPlacesAutocompleteDebug(),
        }
      }
    } finally {
      isSearching.value = false
    }
  }

  watch(query, (q: string) => void searchPlaces(q))

  function select(cell: PlaceCard.Card) {
    const id = canonicalPlaceId(cell.id) || cell.id
    selected.value = {
      id,
      name: cell.name,
      formatted_address: cell.formattedAddress || '',
      lat: 0,
      lng: 0,
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

