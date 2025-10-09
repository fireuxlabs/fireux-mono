# Places Search Report

_Last updated: 2025-10-08_

### Latest changes (2025-10-08)

- Reimagined the places stack UI with Nuxt UI 4 cards, alerts, and grouped actions for a clearer search flow.
- Simplified result cells into badge-driven rows and refreshed the saved places panel to mirror the live suggestions.
- Reflowed the `/places` page into a responsive grid with a quick tips sidebar to surface avatar storage behaviour.
- Tightened the `/places` layout to a left-aligned, max-width column pair so the search stack stays compact on large screens.
- Replaced the search form wrapper with inline label/help markup to avoid missing component warnings while keeping accessibility in place.
- Introduced abortable logo fetches with shared caches plus `cancelLogoRequests`, ensuring shortlist churn cancels stale network calls while keeping the selected place alive.
- Autocomplete responses now skip eager logo fetching; each list item lazily pulls its image the moment it renders, keeping API usage low even for large result sets.
- Places logo resolution now happens on-demand per cell using a shared browser cache, falling back to Maps Details only when a rendered item actually needs a website hint.
- Confirming a result now routes to a new `/places/[id]` detail view that reads the Firestore document and surfaces saved metadata right away.

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

## `packages/extensions/fireux-places/src/runtime/composables/usePlaceLogos.ts`

_Browser-side cache that fetches logos only when a rendered cell needs one._

```typescript
/* eslint-disable no-console */
import type { PlaceCard } from '../models/place.model'

const LOGO_ENDPOINT = '/api/places/logo'
const DETAILS_ENDPOINT = '/api/places/details'

const logoResultCache = new Map<string, string | null>()
const logoPromiseCache = new Map<string, Promise<string | null>>()
const logoAbortControllers = new Map<string, AbortController>()
const detailsResultCache = new Map<string, PlaceDetailsResult | null>()
const detailsPromiseCache = new Map<
  string,
  Promise<PlaceDetailsResult | null>
>()
const detailsAbortControllers = new Map<string, AbortController>()

interface PlaceDetailsResult {
  website?: string | null
  url?: string | null
}

interface LoadLogoOptions {
  priority?: boolean
}

export async function loadLogoForPlace(
  place: PlaceCard.Cell,
  options: LoadLogoOptions = {}
): Promise<string | null> {
  if (typeof window === 'undefined') return place.avatar ?? null
  const placeId = canonicalPlaceId(place.place_id)
  if (!placeId) return place.avatar ?? null

  if (logoResultCache.has(placeId)) {
    return logoResultCache.get(placeId) ?? null
  }

  if (!options.priority) {
    cancelLogoRequest(placeId)
  }

  if (logoPromiseCache.has(placeId)) {
    return logoPromiseCache.get(placeId) ?? null
  }

  const controller = new AbortController()
  logoAbortControllers.set(placeId, controller)

  const promise = fetchLogo(place, placeId, controller.signal)
    .then((url) => {
      logoResultCache.set(placeId, url)
      return url
    })
    .catch((error) => {
      if (isAbortError(error)) {
        return null
      }
      throw error
    })
    .finally(() => {
      if (logoAbortControllers.get(placeId) === controller) {
        logoAbortControllers.delete(placeId)
      }
      logoPromiseCache.delete(placeId)
    })

  logoPromiseCache.set(placeId, promise)
  return promise
}

export function cancelLogoRequests(except?: Set<string>) {
  if (typeof window === 'undefined') return
  for (const [placeId, controller] of logoAbortControllers.entries()) {
    if (except?.has(placeId)) continue
    controller.abort()
    logoAbortControllers.delete(placeId)
    logoPromiseCache.delete(placeId)
  }
}

async function fetchLogo(
  place: PlaceCard.Cell,
  placeId: string,
  signal?: AbortSignal
): Promise<string | null> {
  try {
    const hint = await resolveWebsite(placeId, signal)
    const logoUrl = new URL(LOGO_ENDPOINT, window.location.origin)

    if (hint?.website) {
      logoUrl.searchParams.set('website', hint.website)
    } else if (hint?.url) {
      const domain = extractDomain(hint.url)
      if (domain) logoUrl.searchParams.set('domain', domain)
    }

    if (
      !logoUrl.searchParams.has('website') &&
      !logoUrl.searchParams.has('domain')
    ) {
      const domainFromName = extractDomain(place.formatted_address)
      if (domainFromName) {
        logoUrl.searchParams.set('domain', domainFromName)
      }
    }

    logoUrl.searchParams.set('q', place.name)

    const res = await fetch(logoUrl.toString(), {
      headers: { accept: 'application/json' },
      signal,
    })
    if (!res.ok) {
      console.warn('[places][logos] logo fetch failed', {
        placeId,
        status: res.status,
      })
      return null
    }

    const json = await res.json()
    const url = typeof json?.url === 'string' ? json.url : null
    return url
  } catch (error) {
    if (isAbortError(error)) {
      return null
    }
    console.warn('[places][logos] logo fetch error', { placeId, error })
    return null
  }
}

async function resolveWebsite(
  placeId: string,
  signal?: AbortSignal
): Promise<PlaceDetailsResult | null> {
  if (detailsResultCache.has(placeId)) {
    return detailsResultCache.get(placeId) ?? null
  }

  if (detailsPromiseCache.has(placeId)) {
    return detailsPromiseCache.get(placeId) ?? null
  }

  cancelDetailsRequest(placeId)
  const controller = new AbortController()
  const mergedSignal = mergeSignals(signal, controller.signal)

  const promise = (async () => {
    try {
      const url = new URL(DETAILS_ENDPOINT, window.location.origin)
      url.searchParams.set('place_id', placeId)
      url.searchParams.set('fields', 'website,url')

      const res = await fetch(url.toString(), {
        headers: { accept: 'application/json' },
        cache: 'no-store',
        signal: mergedSignal,
      })
      if (!res.ok) {
        return null
      }

      const json = await res.json()
      const result = (json?.result ?? null) as Record<string, any> | null
      if (!result) return null

      const website = normalizeUrl(result.website)
      const mapsUrl = normalizeUrl(result.url)

      const payload = { website, url: mapsUrl }
      detailsResultCache.set(placeId, payload)
      return payload
    } catch (error) {
      if (isAbortError(error)) {
        return null
      }
      console.warn('[places][logos] details fetch failed', { placeId, error })
      return null
    }
  })().finally(() => {
    detailsPromiseCache.delete(placeId)
    if (detailsAbortControllers.get(placeId) === controller) {
      detailsAbortControllers.delete(placeId)
    }
  })

  detailsAbortControllers.set(placeId, controller)
  detailsPromiseCache.set(placeId, promise)
  return promise
}

function cancelLogoRequest(placeId: string) {
  const controller = logoAbortControllers.get(placeId)
  if (controller) {
    controller.abort()
    logoAbortControllers.delete(placeId)
    logoPromiseCache.delete(placeId)
  }
}

function cancelDetailsRequest(placeId: string) {
  const controller = detailsAbortControllers.get(placeId)
  if (controller) {
    controller.abort()
    detailsAbortControllers.delete(placeId)
    detailsPromiseCache.delete(placeId)
  }
}

function mergeSignals(
  ...signals: (AbortSignal | undefined)[]
): AbortSignal | undefined {
  const valid = signals.filter(Boolean) as AbortSignal[]
  if (!valid.length) return undefined
  if (valid.length === 1) return valid[0]

  const controller = new AbortController()
  const onAbort = () => controller.abort()
  for (const signal of valid) {
    if (signal.aborted) {
      controller.abort()
      break
    }
    signal.addEventListener('abort', onAbort, { once: true })
  }
  return controller.signal
}

function extractDomain(input?: string | null): string | null {
  if (!input) return null
  const normalized = normalizeUrl(input)
  if (normalized) {
    try {
      const url = new URL(normalized)
      if (url.hostname) return url.hostname
    } catch {
      // ignore
    }
  }
  const match = /\b([a-z0-9-]+(?:\.[a-z0-9-]+)+)\b/i.exec(input)
  return match ? match[1] : null
}

function normalizeUrl(value?: string | null): string | null {
  if (!value || typeof value !== 'string') return null
  try {
    const url = new URL(value)
    if (!url.protocol) {
      url.protocol = 'https:'
    }
    return url.toString()
  } catch {
    if (/^https?:\/\//i.test(value)) return value
    return `https://${value}`
  }
}

function canonicalPlaceId(id?: string | null) {
  return (id ?? '').trim().replace(/^"+/, '').replace(/"+$/, '')
}

function isAbortError(error: unknown): error is DOMException {
  return (
    !!error &&
    typeof error === 'object' &&
    'name' in error &&
    (error as { name: string }).name === 'AbortError'
  )
}
```

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

const log = (...args: unknown[]) => {
  if (import.meta.dev) {
    console.info('[places][logos]', ...args)
  }
}

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

    log('autocomplete cells resolved', {
      query,
      total: cells.length,
      pendingCount: cells.filter((cell) => !cell.avatar).length,
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

_Nuxt UI 4 card that orchestrates search state, contextual alerts, and confirmation actions._

```vue
<template>
  <section class="space-y-6">
    <UCard class="shadow-sm" :ui="{ body: 'space-y-5' }">
      <template #header>
        <div class="space-y-1">
          <h2 class="text-base font-semibold text-gray-900">
            Search Google Places
          </h2>
          <p class="text-sm text-gray-500">
            Type to discover locations, review the details, and save the perfect
            match.
          </p>
        </div>
      </template>

      <div class="space-y-2">
        <label :for="searchInputId" class="text-sm font-medium text-gray-700">
          Search
        </label>
        <OrganismsPlacesSearchBar
          v-model="query"
          :id="searchInputId"
          :aria-describedby="searchHelpId"
          aria-label="Search Google Places"
        />
        <p :id="searchHelpId" class="text-xs text-gray-500">
          Powered by Google Places autocomplete
        </p>
      </div>

      <UAlert
        v-if="!hasQuery"
        color="neutral"
        variant="soft"
        icon="i-lucide-compass"
        title="Start typing to see suggestions"
      />

      <OrganismsPlacesSearchSelected
        v-else-if="status === 'selected' && selected"
        :place="selected"
        @clear="onClear"
        @confirm="onConfirm"
      />

      <OrganismsPlacesSearchDropdown
        v-else-if="status === 'results' && results.length"
        :cells="results"
        @select="onSelect"
      />

      <UAlert
        v-else
        color="neutral"
        variant="soft"
        icon="i-lucide-search-x"
        :title="emptyTitle"
        :description="emptyDescription"
      />
    </UCard>
  </section>
</template>

<script setup lang="ts">
/* eslint-disable no-console */
import { computed, onBeforeUnmount, ref, watch, useId } from 'vue'
import type { Place, PlaceCard } from '../../../../models/place.model'
import { usePlaces } from '../../../../composables/usePlaces'

const { searchPlaces, getPlaceDetails, savePlace } = usePlaces()
const { uploadFromUrl } = useImageStorage()

type SearchStatus = 'idle' | 'results' | 'selected'

const query = ref('')
const status = ref<SearchStatus>('idle')
const results = ref<PlaceCard.Cell[]>([])
const selected = ref<Place | null>(null)
const selectedCell = ref<PlaceCard.Cell | null>(null)

const searchInputId = useId()
const searchHelpId = `${searchInputId}-help`

const hasQuery = computed(() => query.value.trim().length > 0)
const emptyTitle = computed(() =>
  hasQuery.value ? 'No matching places yet' : 'Waiting for a search term'
)
const emptyDescription = computed(() =>
  hasQuery.value
    ? 'Try a different name or include the city to refine the results.'
    : 'Enter a business or venue name to pull live suggestions from Google.'
)

const debounceDelay = 250
let debounceId: ReturnType<typeof setTimeout> | null = null

watch(
  () => query.value,
  (value) => {
    const trimmed = value.trim()
    clearDebounce()

    if (!trimmed) {
      results.value = []
      selected.value = null
      status.value = 'idle'
      return
    }

    debounceId = setTimeout(async () => {
      try {
        const cells = await searchPlaces(trimmed)
        results.value = cells
        selected.value = null
        status.value = 'results'
      } catch (error) {
        console.error('[places] search failed', error)
        results.value = []
        status.value = 'idle'
      }
    }, debounceDelay)
  },
  { immediate: true }
)

function clearDebounce() {
  if (debounceId) {
    clearTimeout(debounceId)
    debounceId = null
  }
}

function onSelect(cell: PlaceCard.Cell) {
  const place = toPreviewPlace(cell)
  selected.value = place
  selectedCell.value = cell
  status.value = 'selected'
}

function onClear() {
  selected.value = null
  selectedCell.value = null
  status.value = 'results'
}

async function onConfirm(place: Place) {
  const cell = selectedCell.value
  const placeId = canonicalPlaceId(place.place_id)

  if (!cell || !placeId) {
    console.warn('[places] confirm skipped: missing context', { cell, place })
    selected.value = null
    selectedCell.value = null
    status.value = results.value.length ? 'results' : 'idle'
    return
  }

  if (cell.source !== 'google') {
    console.info('[places] confirm skipped for stored place', {
      placeId,
      source: cell.source,
    })
    selected.value = null
    selectedCell.value = null
    status.value = results.value.length ? 'results' : 'idle'
    return
  }

  try {
    let draft = await resolvePlaceForConfirmation(placeId, place, cell)

    if (cell.source === 'google' && draft.avatar) {
      try {
        const avatarPath = `places/${placeId}/avatar`
        console.log('processing place image', { placeId })
        draft = {
          ...draft,
          avatar: await uploadFromUrl(avatarPath, draft.avatar),
        }
      } catch (error) {
        console.error('[places] avatar upload failed', error)
      }
    }

    await savePlace(draft)
  } catch (error) {
    console.error('[places] confirm failed', error)
  } finally {
    selected.value = null
    selectedCell.value = null
    status.value = results.value.length ? 'results' : 'idle'
  }
}

function toPreviewPlace(cell: PlaceCard.Cell): Place {
  const formattedAddress = cell.formatted_address ?? ''
  const searchTerm = `${cell.name} ${formattedAddress}`.toLowerCase().trim()

  return {
    place_id: cell.place_id,
    name: cell.name,
    formatted_address: formattedAddress,
    lat: 0,
    lng: 0,
    source: 'firestore',
    avatar: cell.avatar ?? null,
    search_term: searchTerm,
    created_at: new Date(),
  }
}

function canonicalPlaceId(id?: string | null) {
  return (id ?? '').trim().replace(/^"+/, '').replace(/"+$/, '')
}

function buildFallbackPlace(
  place: Place,
  cell: PlaceCard.Cell,
  placeId: string
) {
  const formattedAddress = cell.formatted_address ?? place.formatted_address
  const searchTerm = `${place.name} ${formattedAddress}`.toLowerCase().trim()

  return {
    ...place,
    place_id: placeId,
    formatted_address: formattedAddress ?? '',
    search_term: searchTerm,
    created_at: place.created_at ?? new Date(),
  }
}

async function resolvePlaceForConfirmation(
  placeId: string,
  place: Place,
  cell: PlaceCard.Cell
): Promise<Place> {
  try {
    const details = await getPlaceDetails(placeId)
    if (details?.place) {
      return {
        ...details.place,
        place_id: placeId,
        created_at: details.place.created_at ?? new Date(),
      }
    }
  } catch (error) {
    console.error('[places] details fetch failed', error)
  }

  return buildFallbackPlace(place, cell, placeId)
}

onBeforeUnmount(() => {
  clearDebounce()
})

defineExpose({
  query,
  status,
  results,
  selected,
})
</script>
```

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

````

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
````

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
