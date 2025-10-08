# Places Search Report

_Last updated: 2025-10-07_

### Latest changes (2025-10-07)

- Split the search workflow into an orchestrator plus Firestore and Google helpers for clearer ownership.
- Firestore prefix searching now flows through the shared core composable `useFirestoreSearch`, enabling reusable global collection lookups without tenant branching.
- Added the runtime alias `#fireux-core-composables` and renamed the helper to `useFirestoreSearch` so imports stay consistent across packages.
- Converted the Firestore prefix helper to use direct `getDocs` lookups, eliminating the Vue `inject()` warnings that surfaced when the “places” collection was empty.
- Removed the deprecated `usePlacesSearchFirestore.ts` helper from the extension now that consumers rely on the core composable.

## `packages/extensions/fireux-places/src/runtime/composables/usePlacesSearch.ts`

_Composer that orchestrates Firestore-first, Google-second._

```typescript
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
```

## `packages/core/fireux-core/src/runtime/composables/firestore/useFirestoreSearch.ts`

_Reusable Firestore prefix search where callers supply the fully-resolved collection path._

```typescript
import { useFirestoreRead } from './useFirestoreRead'

export interface FirestorePrefixSearchOptions<T> {
  collection: string
  field: keyof T & string
  query: string
  limit?: number
  ssrKey?: string
}

export function useFirestoreSearch() {
  const { firestorePrefixSearch } = useFirestoreRead()

  async function prefixSearch<T>(
    options: FirestorePrefixSearchOptions<T>
  ): Promise<T[]> {
    const { collection, field, query, limit = 10 } = options

    return firestorePrefixSearch<T>(collection, field, query, limit)
  }

  return { prefixSearch }
}
```

## `packages/extensions/fireux-places/src/runtime/composables/usePlacesGoogle.ts`

_Google Autocomplete supplement → `PlaceCard.Cell`._

```typescript
/* eslint-disable no-console */
import type { PlaceCard } from '../models/place.model'

const GOOGLE_AUTOCOMPLETE_ENDPOINT = '/api/places/autocomplete'

const canonicalPlaceId = (id?: string | null) =>
  (id ?? '').trim().replace(/^"+/, '').replace(/"+$/, '')

/**
 * Calls `/api/places/autocomplete?q=...` and returns normalized cells.
 * `excludeIds` should contain canonicalized place_ids to filter dupes.
 */

export async function fetchGoogle(
  query: string,
  excludeIds: Set<string>,
  limit: number
): Promise<PlaceCard.Cell[]> {
  if (limit <= 0 || typeof window === 'undefined') return []

  try {
    const url = new URL(GOOGLE_AUTOCOMPLETE_ENDPOINT, window.location.origin)
    url.searchParams.set('q', query)

    const res = await fetch(url.toString(), {
      headers: { accept: 'application/json' },
    })
    if (!res.ok) return []

    const json = await res.json()
    const preds = Array.isArray(json?.predictions) ? json.predictions : []

    const cells = preds
      .filter((p: any) => {
        const id = canonicalPlaceId(p?.place_id)
        return id && !excludeIds.has(id)
      })
      .slice(0, limit)
      .map((p: any): PlaceCard.Cell => {
        const main = p?.structured_formatting?.main_text
        const secondary = p?.structured_formatting?.secondary_text
        const desc = p?.description
        return {
          place_id: canonicalPlaceId(p.place_id),
          name: main || desc || 'Unknown place',
          avatar: null,
          formatted_address: secondary || desc || undefined,
          source: 'google',
        }
      })

    if (import.meta.dev) {
      console.log('[places] google supplement results', {
        query,
        requested: limit,
        count: cells.length,
        ids: cells.map((c) => c.place_id),
      })
    }

    return cells
  } catch (err) {
    if (import.meta.dev) console.error('[places] google supplement failed', err)
    return []
  }
}
```

## `packages/extensions/fireux-places/src/runtime/composables/usePlaces.ts`

_Composable that exposes the Firestore collection/doc readers and re-exports the search helper._

```typescript
import { useFirestoreManager } from '#imports'
import type { Ref } from 'vue'
import type { Place, PlaceCard } from '../models/place.model'
import { usePlacesSearch, type UsePlacesSearchResult } from './usePlacesSearch'

export interface UsePlacesResult extends UsePlacesSearchResult {
  collection: Ref<Place[] | undefined>
  place: (id: string) => Ref<Place | undefined>
  searchPlaces: (query: string) => Promise<PlaceCard.Cell[]>
}

export function usePlaces(): UsePlacesResult {
  const { firestoreFetchCollection, firestoreFetchDoc } = useFirestoreManager()

  const collection = firestoreFetchCollection<Place>('places')
  const place = (id: string) => firestoreFetchDoc<Place>('places', id)

  return {
    collection,
    place,
    ...usePlacesSearch(),
  }
}
```

## `packages/extensions/fireux-places/src/runtime/components/organisms/places/Search/Section.vue`

_UI section that wires the search composable to live Firestore/Google results with categorized output._

```vue
<template>
  <UCard>
    <div class="space-y-4">
      <p class="text-sm text-gray-500">
        Firestore-first search runs automatically while you type. Results are
        logged and rendered below.
      </p>

      <UInput
        v-model="query"
        icon="i-lucide-search"
        placeholder="Type a place name…"
      />

      <p v-if="message" class="text-xs text-gray-500">
        {{ message }}
      </p>

      <div
        v-if="firestoreResults.length || googleResults.length"
        class="space-y-5"
      >
        <div v-if="firestoreResults.length" class="space-y-3">
          <div class="flex items-center justify-between text-xs text-gray-500">
            <span>Firestore matches</span>
            <UBadge color="neutral" size="2xs">{{
              firestoreResults.length
            }}</UBadge>
          </div>

          <ul class="space-y-2">
            <li
              v-for="place in firestoreResults"
              :key="place.place_id"
              class="rounded border border-gray-100 px-3 py-2"
            >
              <div class="flex items-start justify-between gap-3">
                <div>
                  <div class="font-medium">{{ place.name }}</div>
                  <div class="text-xs text-gray-500">
                    {{ place.formatted_address || '—' }}
                  </div>
                  <div class="text-[11px] text-gray-400">
                    ID: {{ place.place_id }}
                  </div>
                </div>
                <UBadge color="green" size="2xs">Saved</UBadge>
              </div>
            </li>
          </ul>
        </div>

        <div v-if="googleResults.length" class="space-y-3">
          <div class="flex items-center justify-between text-xs text-gray-500">
            <span>Google suggestions</span>
            <UBadge color="primary" size="2xs">{{
              googleResults.length
            }}</UBadge>
          </div>

          <ul class="space-y-2">
            <li
              v-for="place in googleResults"
              :key="place.place_id"
              class="rounded border border-blue-50 bg-blue-50/30 px-3 py-2"
            >
              <div class="flex items-start justify-between gap-3">
                <div>
                  <div class="font-medium">{{ place.name }}</div>
                  <div class="text-xs text-gray-500">
                    {{ place.formatted_address || '—' }}
                  </div>
                  <div class="text-[11px] text-gray-400">
                    ID: {{ place.place_id }}
                  </div>
                </div>
                <UBadge color="primary" size="2xs">Google</UBadge>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
/* eslint-disable no-console */
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import type { PlaceCard } from '../../../../models/place.model'
import { usePlaces } from '../../../../composables/usePlaces'

const { searchPlaces } = usePlaces()

const query = ref('')
const message = ref('')
const results = ref<PlaceCard.Cell[]>([])
const debounceDelay = 250
const minLength = 3

const firestoreResults = computed(() =>
  results.value.filter((place) => place.source === 'firestore')
)
const googleResults = computed(() =>
  results.value.filter((place) => place.source === 'google')
)

function formatResultsMessage(
  value: string,
  firestoreCount: number,
  googleCount: number
): string {
  if (firestoreCount === 0 && googleCount === 0) {
    return `No matches for “${value}”.`
  }

  if (firestoreCount > 0 && googleCount === 0) {
    const suffix = firestoreCount === 1 ? '' : 'es'
    return `${firestoreCount} Firestore match${suffix} found for “${value}”.`
  }

  if (firestoreCount === 0 && googleCount > 0) {
    const suffix = googleCount === 1 ? '' : 's'
    return `No Firestore matches; showing ${googleCount} Google suggestion${suffix} for “${value}”.`
  }

  const firestoreSuffix = firestoreCount === 1 ? '' : 'es'
  const googleSuffix = googleCount === 1 ? '' : 's'
  return `${firestoreCount} Firestore match${firestoreSuffix} plus ${googleCount} Google suggestion${googleSuffix} for “${value}”.`
}

let debounceId: ReturnType<typeof setTimeout> | null = null

function clearDebounce() {
  if (debounceId) {
    clearTimeout(debounceId)
    debounceId = null
  }
}

watch(
  () => query.value,
  (raw) => {
    clearDebounce()

    const value = raw.trim()

    if (!value) {
      results.value = []
      message.value =
        'Type a place name to search your saved Firestore entries.'
      return
    }

    if (value.length < minLength) {
      results.value = []
      message.value = `Keep typing… minimum ${minLength} characters for Firestore search.`
      return
    }

    message.value = `Searching for “${value}”…`

    debounceId = setTimeout(async () => {
      try {
        const matches = await searchPlaces(value)

        if (import.meta.dev) {
          console.log('[places] Firestore search results', {
            query: value,
            matches,
          })
        }

        if (query.value.trim() !== value) {
          return
        }

        results.value = matches

        const firestoreCount = firestoreResults.value.length
        const googleCount = googleResults.value.length

        message.value = formatResultsMessage(value, firestoreCount, googleCount)
      } catch (error) {
        if (import.meta.dev) {
          console.error('[places] Firestore search error', error)
        }
        if (query.value.trim() === value) {
          results.value = []
          message.value = 'Search failed. Check console for details.'
        }
      }
    }, debounceDelay)
  },
  { immediate: true }
)

onBeforeUnmount(() => {
  clearDebounce()
})
</script>
```

## `packages/extensions/fireux-places/src/runtime/components/organisms/places/List.vue`

_Simple list component that renders all saved Firestore places._

```vue
<template>
  <UCard>
    <div class="space-y-3">
      <div class="flex items-center justify-between">
        <h2 class="text-sm font-medium text-gray-500">Saved places</h2>
        <UBadge color="neutral" size="xs">{{ items.length }}</UBadge>
      </div>

      <ul v-if="items.length" class="space-y-2">
        <li
          v-for="place in items"
          :key="place.place_id"
          class="rounded border border-gray-100 px-3 py-2"
        >
          <div class="font-medium">{{ place.name }}</div>
          <div class="text-xs text-gray-500">
            {{ place.formatted_address || '—' }}
          </div>
          <div class="text-[11px] text-gray-400">ID: {{ place.place_id }}</div>
        </li>
      </ul>

      <p v-else class="text-sm text-gray-500">
        No saved places yet. Add a Firestore doc in <code>places</code> to see
        it here.
      </p>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { usePlaces } from '../../../composables/usePlaces'

const { collection } = usePlaces()

const items = computed(() => collection.value ?? [])
</script>
```

## `packages/extensions/fireux-places/src/runtime/pages/places.vue`

_Page entry point wiring the search section and saved list into the Nuxt UI layout._

```vue
<!-- `packages/extensions/fireux-places/src/runtime/pages/places.vue` -->

<template>
  <UPage>
    <UPageHeader
      title="Places"
      description="Search for locations, inspect Google details, and review saved entries."
    />

    <UContainer class="py-8 space-y-8">
      <OrganismsPlacesSearchSection />

      <OrganismsPlacesList />
    </UContainer>
  </UPage>
</template>

<script setup lang="ts"></script>
```

## `packages/extensions/fireux-places/src/runtime/models/place.model.ts`

_Shared place models and helpers used by both search and rendering layers._

```typescript
/** ───────────────────────────────
 * Base (shared by both Google & Firestore)
 * ─────────────────────────────── */
export interface BasePlace {
  place_id: string
  name: string
  formatted_address: string
  lat: number
  lng: number
  source: 'google' | 'firestore'
  website?: string | null
  phone?: string | null
  rating?: number | null
  user_ratings_total?: number | null
}

/** ───────────────────────────────
 * Google Place (transient)
 * ─────────────────────────────── */
export interface GooglePlace extends BasePlace {
  source: 'google'
  photo_reference?: string | null
  photo_url?: string | null
}

/** ───────────────────────────────
 * Firestore Place (stored)
 * ─────────────────────────────── */
export interface Place extends BasePlace {
  source: 'firestore'
  avatar?: string | null
  search_term: string
  created_at: any
  updated_at?: any
}

/** ───────────────────────────────
 * Cards (UI)
 * ─────────────────────────────── */
export namespace PlaceCard {
  export interface Pill {
    place_id: string
    name: string
    avatar?: string | null
  }
  export interface Cell extends Pill {
    source: PlaceSource
    formatted_address?: string
  }
}

/** ───────────────────────────────
 * Helper Mappers
 * ─────────────────────────────── */

// GooglePlace → Firestore Place
export function toStoredPlace(g: GooglePlace): Place {
  const search_term = `${g.name} ${g.formatted_address}`.toLowerCase()
  return {
    ...g,
    source: 'firestore',
    avatar: g.photo_url ?? null,
    search_term,
    created_at: new Date(),
  }
}

// Any place-like → Cell (UI helper)
export function toCell(
  p: BasePlace & { avatar?: string | null }
): PlaceCard.Cell {
  return {
    place_id: p.place_id,
    name: p.name,
    avatar: p.avatar ?? null,
    source: p.source,
    formatted_address: p.formatted_address,
  }
}
```
