# Places Search Report

_Last updated: 2025-10-07_

This report captures the current state of the FireUX Places search stack, including composables, UI components, and supporting models. Each section lists the absolute repo path and the complete file contents as of this snapshot.

## `packages/extensions/fireux-places/src/runtime/composables/usePlacesSearch.ts`

_Composable that performs Firestore-first search with Google supplementation when fewer than four local matches are found._

```typescript
/* eslint-disable no-console */
import type { Ref } from 'vue'
import type { Place, PlaceCard } from '../models/place.model'

export interface UsePlacesSearchResult {
  searchPlaces: (query: string) => Promise<PlaceCard.Cell[]>
}

const MIN_FIRESTORE_RESULTS_BEFORE_SUPPLEMENT = 4
const MAX_RESULTS = 10
const GOOGLE_AUTOCOMPLETE_ENDPOINT = '/api/places/autocomplete'

const canonicalPlaceId = (id: string | null | undefined) =>
  (id ?? '').trim().replace(/^"+/, '').replace(/"+$/, '')

export function usePlacesSearch(
  collection?: Ref<Place[] | undefined>
): UsePlacesSearchResult {
  const norm = (value: string) =>
    value
      .toLowerCase()
      .normalize('NFKD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^\p{L}\p{N}\s]/gu, '')
      .replace(/\s+/g, ' ')
      .trim()

  const tokens = (value: string) =>
    norm(value)
      .split(' ')
      .filter((token) => token.length >= 3)

  const scoreTokenMatch = (token: string, candidate: string): number => {
    if (candidate === token) return 3
    if (candidate.startsWith(token) || token.startsWith(candidate)) return 2
    if (candidate.includes(token)) return 1
    return 0
  }

  const shouldIncludeMatch = (
    queryTokens: string[],
    strongMatches: number,
    normalizedHaystack: string,
    normalizedQuery: string
  ): boolean => {
    if (queryTokens.length === 0) {
      return (
        normalizedQuery.length >= 2 &&
        normalizedHaystack.includes(normalizedQuery)
      )
    }

    const requiredStrongMatches =
      queryTokens.length >= 2 ? Math.min(queryTokens.length, 2) : 1
    if (strongMatches >= requiredStrongMatches) {
      return true
    }

    return normalizedHaystack.includes(normalizedQuery)
  }

  const toFirestoreCell = (place: Place): PlaceCard.Cell => ({
    place_id: canonicalPlaceId(place.place_id),
    name: place.name,
    avatar: place.avatar ?? null,
    formatted_address: place.formatted_address,
    rating: place.rating ?? null,
    meta_right: 'Firestore',
  })

  const missingSearchTermWarnings = new Set<string>()

  async function fetchGoogleSupplement(
    query: string,
    excludeIds: Set<string>,
    limit: number
  ): Promise<PlaceCard.Cell[]> {
    if (limit <= 0) return []
    if (typeof window === 'undefined') return []

    try {
      const url = new URL(GOOGLE_AUTOCOMPLETE_ENDPOINT, window.location.origin)
      url.searchParams.set('q', query)

      const response = await fetch(url.toString(), {
        headers: {
          accept: 'application/json',
        },
      })

      if (!response.ok) {
        return []
      }

      const payload = await response.json()
      const predictions = Array.isArray(payload?.predictions)
        ? payload.predictions
        : []

      const filteredPredictions = predictions.filter((prediction: any) => {
        const id = canonicalPlaceId(prediction?.place_id)
        if (!id) return false
        return !excludeIds.has(id)
      })

      const trimmedPredictions = filteredPredictions.slice(0, limit)

      return trimmedPredictions.map((prediction: any): PlaceCard.Cell => {
        const mainText = prediction?.structured_formatting?.main_text
        const secondaryText = prediction?.structured_formatting?.secondary_text
        const description = prediction?.description ?? ''

        return {
          place_id: prediction.place_id,
          name: mainText || description || 'Unknown place',
          avatar: null,
          formatted_address: secondaryText || description || undefined,
          rating: null,
          meta_right: 'Google',
        }
      })
    } catch (error) {
      if (import.meta.dev) {
        console.error('[places] Google supplement failed', error)
      }
      return []
    }
  }

  async function searchPlaces(query: string): Promise<PlaceCard.Cell[]> {
    const normalizedQuery = norm(query)
    if (!normalizedQuery) return []

    const queryTokens = tokens(normalizedQuery)
    const list = collection?.value ?? []

    const localMatches = list
      .map((place) => {
        const canonicalId = canonicalPlaceId(place.place_id)
        if (import.meta.dev && !place.search_term) {
          if (!missingSearchTermWarnings.has(canonicalId)) {
            missingSearchTermWarnings.add(canonicalId)
            console.warn(
              `[places] Missing search_term for place ${canonicalId}. Consider running the data hygiene script to backfill.`
            )
          }
        }

        const haystack = [
          place.name,
          place.formatted_address,
          place.search_term,
        ]
          .filter(Boolean)
          .join(' ')

        const normalizedHaystack = norm(haystack)
        if (!normalizedHaystack) return null

        const haystackTokens = normalizedHaystack
          .split(' ')
          .filter((token) => token.length >= 3)

        const tokenScores = queryTokens.map((token) => {
          let bestScore = 0
          for (const candidate of haystackTokens) {
            const score = scoreTokenMatch(token, candidate)
            if (score === 3) {
              bestScore = 3
              break
            }
            if (score > bestScore) {
              bestScore = score
            }
          }
          return bestScore
        })

        const strongMatches = tokenScores.filter((score) => score >= 2).length
        const include = shouldIncludeMatch(
          queryTokens,
          strongMatches,
          normalizedHaystack,
          normalizedQuery
        )

        if (!include) return null

        const tokenScore = tokenScores.reduce((sum, score) => sum + score, 0)
        const substringBonus = normalizedHaystack.includes(normalizedQuery)
          ? Math.max(2, queryTokens.length)
          : 0

        return {
          place,
          score: tokenScore + substringBonus,
        }
      })
      .filter(Boolean)
      .sort((a, b) => b!.score - a!.score) as Array<{
      place: Place
      score: number
    }>

    const firestoreCells = localMatches.map(({ place }) =>
      toFirestoreCell(place)
    )

    if (firestoreCells.length >= MIN_FIRESTORE_RESULTS_BEFORE_SUPPLEMENT) {
      return firestoreCells
    }

    const excludeIds = new Set(
      firestoreCells.map((cell) => canonicalPlaceId(cell.place_id))
    )
    const supplementLimit = Math.max(
      0,
      MIN_FIRESTORE_RESULTS_BEFORE_SUPPLEMENT - firestoreCells.length
    )
    const googleCells = await fetchGoogleSupplement(
      query,
      excludeIds,
      supplementLimit
    )

    const combined = [...firestoreCells, ...googleCells].filter(
      (cell, index, array) =>
        array.findIndex(
          (candidate) =>
            canonicalPlaceId(candidate.place_id) ===
            canonicalPlaceId(cell.place_id)
        ) === index
    )

    if (combined.length > 0) {
      const limited = combined.slice(0, MAX_RESULTS)
      if (firestoreCells.length === 0) {
        console.log(
          `[places] No local match for "${query}", returning Google suggestions.`
        )
      }
      return limited
    }

    console.log(`[places] No local or Google match for "${query}".`)
    return []
  }

  return { searchPlaces }
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
    ...usePlacesSearch(collection),
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
  results.value.filter((place) => place.meta_right === 'Firestore')
)
const googleResults = computed(() =>
  results.value.filter((place) => place.meta_right === 'Google')
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
    formatted_address?: string
    rating?: number | null
    meta_right?: string | null // “Saved” | “Google” | etc.
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
    formatted_address: p.formatted_address,
    rating: p.rating ?? null,
    meta_right: p.source === 'firestore' ? 'Saved' : 'Google',
  }
}
```
