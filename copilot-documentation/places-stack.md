# FireUX Places Stack

Current source snapshots for the Places search and management flow under `packages/extensions/fireux-places/src/runtime/`.

## components/organisms/places/Search/Bar.vue

```vue
<template>
  <UInput
    v-model="internalValue"
    icon="i-lucide-search"
    placeholder="Type a place name…"
    size="lg"
    autofocus
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface SearchBarProps {
  modelValue: string
}

const props = defineProps<SearchBarProps>()
const emit = defineEmits<(event: 'update:modelValue', value: string) => void>()

const internalValue = computed({
  get: () => props.modelValue,
  set: (value: string) => emit('update:modelValue', value),
})
</script>
```

## components/organisms/places/Search/Dropdown.vue

```vue
<template>
  <UCard
    v-if="visibleCells.length"
    class="shadow-sm w-full max-w-md"
    :ui="{ body: 'p-0' }"
  >
    <template #header>
      <div class="flex items-center gap-2 text-sm font-medium text-gray-700">
        <UIcon name="i-lucide-list-tree" />
        <span>Suggestions</span>
        <UBadge color="primary" variant="soft" size="xs">
          {{ visibleCells.length }}
        </UBadge>
      </div>
    </template>

    <ul class="divide-y divide-gray-100 dark:divide-gray-800">
      <li v-for="cell in visibleCells" :key="cell.place_id">
        <UButton
          color="neutral"
          variant="ghost"
          class="w-full justify-start px-4 py-3"
          @click="onSelect(cell)"
        >
          <OrganismsPlacesCell :place="cell" />
        </UButton>
      </li>
    </ul>
  </UCard>
</template>

<script setup lang="ts">
import { computed, toRefs, watch } from 'vue'
import type { PlaceCard } from '../../../../models/place.model'
import { cancelLogoRequests } from '../../../../composables/usePlaceLogos'
import { canonicalPlaceId } from '../../../../composables/usePlacesGoogle'
import { PLACES_SEARCH_SHORTLIST_LIMIT } from '../../../../composables/usePlacesSearch'

interface SearchDropdownProps {
  cells?: PlaceCard.Cell[] | null
}

const props = withDefaults(defineProps<SearchDropdownProps>(), {
  cells: () => [],
})
const { cells } = toRefs(props)
const emit = defineEmits<(event: 'select', cell: PlaceCard.Cell) => void>()

const visibleCells = computed(() =>
  (cells.value ?? []).slice(0, PLACES_SEARCH_SHORTLIST_LIMIT)
)

watch(
  visibleCells,
  (next) => {
    const keep = new Set(next.map((cell) => canonicalPlaceId(cell.place_id)))
    cancelLogoRequests(keep)
  },
  { immediate: true }
)

function onSelect(cell: PlaceCard.Cell) {
  emit('select', cell)
}
</script>
```

## components/organisms/places/Search/Section.vue

```vue
<template>
  <section class="space-y-4">
    <UCard class="shadow-sm" :ui="{ body: 'space-y-4' }">
      <OrganismsPlacesSearchBar v-model="query" />

      <template v-if="selected">
        <OrganismsPlacesSearchSelected
          :place="selected"
          :saving="isSaving"
          :disabled="isSelectionDisabled"
          :show-confirm="shouldShowConfirm"
          :confirm-label="confirmButtonText"
          @clear="handleClear"
          @confirm="handleConfirm"
        />

        <p
          v-if="shouldAutoSave && !isAuthenticated"
          class="text-xs text-rose-600"
        >
          You need to sign in before saving places.
        </p>
        <p
          v-else-if="shouldAutoSave && saveError"
          class="text-xs text-rose-600"
        >
          {{ saveError }}
        </p>
        <p
          v-else-if="shouldAutoSave && saveSuccess"
          class="text-xs text-emerald-600"
        >
          Place saved to Firestore.
        </p>
      </template>

      <OrganismsPlacesSearchDropdown
        v-else
        :cells="results"
        @select="selectCell"
      />

      <p v-if="isSearching" class="text-xs text-gray-500">Searching…</p>

      <p v-else-if="showEmpty" class="text-xs text-gray-500">
        No matching places yet.
      </p>
    </UCard>
  </section>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch, withDefaults } from 'vue'
import type { BasePlace, Place } from '../../../../models/place.model'
import { usePlacesSearchVm } from '../../../../composables/usePlacesSearch'
import { usePlaceSave } from '../../../../composables/usePlaceSave'
import {
  canonicalPlaceId,
  fetchPlaceDetails,
} from '../../../../composables/usePlacesGoogle'
import { useAuth } from '#imports'

interface PlacesSearchConfirmEvent {
  place: BasePlace
  canonicalId: string
  source: BasePlace['source']
  saved: boolean
  storedPlace?: Place
}

const props = withDefaults(
  defineProps<{
    autoSave?: boolean
    autoClear?: boolean
    showConfirmButton?: boolean
    confirmLabel?: string
  }>(),
  {
    autoSave: true,
    autoClear: true,
  }
)

const emit = defineEmits<{
  (event: 'select', payload: BasePlace | null): void
  (event: 'confirm', payload: PlacesSearchConfirmEvent): void
}>()

const {
  query,
  results,
  selected,
  isSearching,
  showEmpty,
  select: selectCell,
  clear: clearSelected,
} = usePlacesSearchVm()

const { savePlace } = usePlaceSave()
const { currentUser } = useAuth()

const isSaving = ref(false)
const saveError = ref<string | null>(null)
const saveSuccess = ref(false)
let successResetTimer: ReturnType<typeof setTimeout> | null = null

const isAuthenticated = computed(() => !!currentUser.value)
const shouldAutoSave = computed(() => props.autoSave !== false)
const shouldAutoClear = computed(() => props.autoClear !== false)
const shouldShowConfirm = computed(() =>
  props.showConfirmButton === undefined
    ? true
    : props.showConfirmButton !== false
)
const confirmButtonText = computed(() => props.confirmLabel || undefined)
const isSelectionDisabled = computed(
  () => shouldAutoSave.value && !isAuthenticated.value
)

watch(selected, (next) => {
  saveError.value = null
  if (next) {
    saveSuccess.value = false
    clearSuccessTimer()
  }
  emit('select', next)
})

function clearSuccessTimer() {
  if (successResetTimer) {
    clearTimeout(successResetTimer)
    successResetTimer = null
  }
}

function scheduleSuccessReset() {
  clearSuccessTimer()
  successResetTimer = setTimeout(() => {
    saveSuccess.value = false
    successResetTimer = null
  }, 3000)
}

function clearSearchInputs() {
  clearSelected()
  query.value = ''
}

function buildFallbackPlace(place: BasePlace, canonicalId: string): Place {
  const searchTerm = `${place.name} ${place.formatted_address}`
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim()

  return {
    place_id: canonicalId,
    name: place.name,
    formatted_address: place.formatted_address,
    lat: place.lat,
    lng: place.lng,
    source: 'firestore',
    avatar: place.avatar ?? null,
    search_term: searchTerm,
    created_at: new Date(),
  }
}

async function handleConfirm(place: BasePlace) {
  if (isSaving.value) return

  const canonicalId = canonicalPlaceId(place.place_id)
  if (!canonicalId) {
    saveError.value = 'Cannot save place without a valid identifier.'
    return
  }

  const basePayload: PlacesSearchConfirmEvent = {
    place: {
      ...place,
      place_id: canonicalId,
    },
    canonicalId,
    source: place.source,
    saved: false,
  }

  if (!shouldAutoSave.value) {
    emit('confirm', basePayload)
    if (shouldAutoClear.value) {
      clearSearchInputs()
    }
    return
  }

  if (!isAuthenticated.value) {
    saveError.value = 'Sign in to save places.'
    return
  }

  isSaving.value = true
  saveError.value = null
  saveSuccess.value = false

  try {
    const details = await fetchPlaceDetails(canonicalId)
    const payload = details?.stored
      ? {
          ...details.stored,
          avatar: place.avatar ?? details.stored.avatar ?? null,
        }
      : buildFallbackPlace(place, canonicalId)

    await savePlace(payload)
    saveSuccess.value = true
    scheduleSuccessReset()
    emit('confirm', {
      ...basePayload,
      saved: true,
      storedPlace: payload,
    })
    if (shouldAutoClear.value) {
      clearSearchInputs()
    }
  } catch (error) {
    saveError.value =
      error instanceof Error
        ? error.message
        : 'Failed to save place to Firestore.'
  } finally {
    isSaving.value = false
  }
}

function handleClear() {
  clearSearchInputs()
  saveError.value = null
  saveSuccess.value = false
  clearSuccessTimer()
}

onBeforeUnmount(() => {
  clearSuccessTimer()
})

async function confirmSelection() {
  const current = selected.value
  if (!current) return
  await handleConfirm(current)
}

defineExpose({
  clearSelection: clearSelected,
  confirmSelection,
  selected,
})
</script>
```

## components/organisms/places/Search/Selected.vue

```vue
<template>
  <UCard class="shadow-sm" :ui="{ body: 'space-y-4' }">
    <div class="flex items-start gap-3">
      <div class="relative flex-shrink-0">
        <UAvatar
          :src="displayAvatar || undefined"
          :alt="place.name"
          size="lg"
          icon="i-lucide-map-pin"
        />
        <div
          v-if="showSpinner"
          class="absolute inset-0 flex items-center justify-center rounded-full bg-white/70 backdrop-blur-sm dark:bg-gray-950/60"
        >
          <UIcon
            name="i-lucide-loader-2"
            class="h-5 w-5 animate-spin text-gray-400"
          />
        </div>
      </div>

      <div class="flex-1 space-y-1">
        <p class="text-sm font-semibold text-gray-900">{{ place.name }}</p>
        <p class="text-sm text-gray-500">
          {{ place.formatted_address || '—' }}
        </p>
        <div
          v-if="errorMessage"
          class="flex items-center gap-1 text-xs font-medium text-amber-600"
        >
          <UIcon name="i-lucide-alert-triangle" class="h-3.5 w-3.5" />
          <span>{{ errorMessage }}</span>
        </div>
      </div>
    </div>
    <template #footer>
      <div class="flex w-full flex-wrap items-center justify-between gap-2">
        <UButton
          v-if="showRetryButton"
          size="sm"
          color="primary"
          variant="ghost"
          :loading="isFetchingLogo"
          :disabled="isFetchingLogo"
          @click="handleRetry()"
        >
          <UIcon
            v-if="!isFetchingLogo"
            name="i-lucide-refresh-ccw"
            class="mr-1 h-4 w-4"
          />
          <UIcon
            v-else
            name="i-lucide-loader-2"
            class="mr-1 h-4 w-4 animate-spin"
          />
          {{ retryLabel }}
        </UButton>

        <div class="ml-auto flex items-center gap-2">
          <UButton
            size="sm"
            color="neutral"
            variant="soft"
            :disabled="isActionDisabled"
            @click="handleClear"
          >
            <UIcon name="i-lucide-x" class="mr-1" /> Clear
          </UButton>
          <UButton
            size="sm"
            color="primary"
            variant="soft"
            icon="i-lucide-check"
            :loading="isSavingSelection"
            :disabled="isActionDisabled"
            @click="handleConfirm"
          >
            {{ confirmLabel }}
          </UButton>
        </div>
      </div>
    </template>
  </UCard>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount } from 'vue'
import type { BasePlace } from '../../../../../models/place.model'
import {
  DEFAULT_LOGO_TIMEOUT_MS,
  sanitizeLogoAvatar,
  usePlaceLogoState,
} from '../../../../composables/usePlaceLogos'

const emit = defineEmits<{
  (event: 'clear'): void
  (event: 'confirm', place: BasePlace): void
}>()

const props = defineProps<{
  place: BasePlace
  saving?: boolean
  disabled?: boolean
}>()
const place = computed(() => props.place)

const logoState = usePlaceLogoState(place, {
  timeoutMs: DEFAULT_LOGO_TIMEOUT_MS,
  autoHydrate: true,
  retryOnEmpty: true,
  shouldHydrate: (next, currentAvatar) =>
    next.source === 'google' && !currentAvatar,
  emptyMessage: 'No logo yet. Try again?',
})

const displayAvatar = computed(
  () => logoState.avatar.value ?? sanitizeLogoAvatar(props.place.avatar)
)
const isFetchingLogo = computed(() => logoState.isLoading.value)
const showSpinner = computed(() => isFetchingLogo.value && !displayAvatar.value)
const showRetryButton = computed(
  () =>
    props.place.source === 'google' &&
    logoState.hasAttempted.value &&
    !displayAvatar.value
)
const errorMessage = computed(() => logoState.error.value)
const retryLabel = computed(() =>
  isFetchingLogo.value ? 'Retrying…' : 'Retry logo'
)
const isSavingSelection = computed(() => !!props.saving)
const isDisabledByAuth = computed(() => !!props.disabled)
const isActionDisabled = computed(
  () => isSavingSelection.value || isDisabledByAuth.value
)
const confirmLabel = computed(() => {
  if (isSavingSelection.value) return 'Saving…'
  if (isDisabledByAuth.value) return 'Sign in to save'
  return 'Confirm'
})

async function handleRetry() {
  if (isFetchingLogo.value) return
  await logoState.retry()
}

function handleClear() {
  if (isActionDisabled.value) return
  emit('clear')
}

function handleConfirm() {
  if (isActionDisabled.value) return
  const payload: BasePlace = {
    ...props.place,
    avatar: displayAvatar.value ?? null,
  }
  emit('confirm', payload)
}

onBeforeUnmount(() => {
  logoState.cancel()
})
</script>
```

## components/organisms/places/Cell.vue

```vue
<template>
  <div class="flex w-full items-center gap-3">
    <div class="relative flex-shrink-0">
      <UAvatar
        :src="previewSrc || undefined"
        :alt="place.name"
        size="md"
        icon="i-lucide-map-pin"
      />
      <div v-if="showSpinner" class="absolute -bottom-1 -right-1">
        <UBadge color="success" variant="soft" size="xs" class="shadow-sm">
          <UIcon name="i-lucide-loader-2" class="h-3 w-3 animate-spin" />
        </UBadge>
      </div>
      <div v-else-if="canRetry" class="absolute -bottom-1 -right-1">
        <UTooltip text="Retry logo">
          <UButton
            size="2xs"
            color="primary"
            variant="ghost"
            class="shadow-sm"
            :disabled="isFetchingLogo"
            aria-label="Retry logo"
            @click.stop.prevent="handleRetry"
          >
            <UIcon
              v-if="!isFetchingLogo"
              name="i-lucide-refresh-ccw"
              class="h-3.5 w-3.5"
            />
            <UIcon
              v-else
              name="i-lucide-loader-2"
              class="h-3.5 w-3.5 animate-spin"
            />
          </UButton>
        </UTooltip>
      </div>
    </div>

    <div class="min-w-0 flex-1 text-left">
      <p class="truncate text-sm font-medium text-gray-900">
        {{ place.name }}
      </p>
      <p v-if="place.formatted_address" class="truncate text-xs text-gray-500">
        {{ place.formatted_address }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount } from 'vue'
import type { PlaceCard } from 'fireux-places/runtime/models/place.model'
import {
  DEFAULT_LOGO_TIMEOUT_MS,
  usePlaceLogoState,
} from '../../../composables/usePlaceLogos'

interface CellProps {
  place: PlaceCard.Cell
}

const props = defineProps<CellProps>()
const place = computed(() => props.place)

const logoState = usePlaceLogoState(place, {
  timeoutMs: DEFAULT_LOGO_TIMEOUT_MS,
  autoHydrate: true,
  priority: true,
  retryOnEmpty: true,
  shouldHydrate: (_next, currentAvatar) => !currentAvatar,
})

const previewSrc = computed(() => logoState.avatar.value)
const isFetchingLogo = computed(() => logoState.isLoading.value)
const showSpinner = computed(() => isFetchingLogo.value && !previewSrc.value)
const canRetry = computed(
  () =>
    logoState.canHydrate.value &&
    logoState.hasAttempted.value &&
    !isFetchingLogo.value &&
    !previewSrc.value
)

async function handleRetry(event?: MouseEvent) {
  event?.stopPropagation()
  if (isFetchingLogo.value) return
  await logoState.retry()
}

onBeforeUnmount(() => {
  logoState.cancel()
})
</script>
```

## components/organisms/places/List.vue

```vue
<template>
  <UCard class="shadow-sm" :ui="{ body: 'space-y-4' }">
    <template #header>
      <div class="flex items-center justify-between">
        <div
          class="flex items-center gap-2 text-sm font-semibold text-gray-800"
        >
          <UIcon name="i-lucide-bookmark" /> Saved places
        </div>
        <UBadge color="neutral" variant="soft" size="xs">{{
          cells.length
        }}</UBadge>
      </div>
    </template>

    <div v-if="cells.length" class="space-y-2">
      <UButton
        v-for="cell in cells"
        :key="cell.place_id"
        :to="`/places/${cell.place_id}`"
        color="neutral"
        variant="ghost"
        class="w-full justify-start px-3 py-3"
      >
        <OrganismsPlacesCell :place="cell" />
      </UButton>
    </div>

    <UAlert
      v-else
      color="neutral"
      variant="soft"
      icon="i-lucide-inbox"
      title="No saved places yet"
      description="Add a place to Firestore and it will appear here instantly."
    />
  </UCard>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { usePlaces } from '../../../composables/usePlaces'
import { toCell } from 'fireux-places/runtime/models/place.model'

const { collection } = usePlaces()
const cells = computed(() =>
  (collection.value ?? []).map((place) =>
    toCell({ ...place, avatar: place.avatar ?? null })
  )
)
</script>
```

## composables/usePlacesSearch.ts

```typescript
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
```

## composables/usePlaceSave.ts

```typescript
import { useFirestoreManager } from '#imports'
import { doc, getDoc } from 'firebase/firestore'
import { useFirestore } from 'vuefire'
import type { Place } from '../models/place.model'
import { canonicalPlaceId } from './usePlacesGoogle'

export function usePlaceSave() {
  const { setDocument } = useFirestoreManager()
  const db = useFirestore()

  async function savePlace(place: Place) {
    const id = canonicalPlaceId(place.place_id)
    if (!id) {
      throw new Error('Cannot save place without a valid place_id')
    }

    const payload: Record<string, any> = {
      ...place,
      place_id: id,
      source: 'firestore',
    }

    delete payload.created_at
    delete payload.updated_at

    const docRef = doc(db, 'places', id)
    const snapshot = await getDoc(docRef)
    if (snapshot.exists()) {
      throw new Error('This place already exists.')
    }

    await setDocument('places', id, payload)
  }

  return { savePlace }
}
```

## composables/usePlaces.ts

```typescript
import { useFirestoreManager } from '#imports'
import type { Place } from '../models/place.model'
import { usePlacesSearch } from './usePlacesSearch'

export function usePlaces() {
  const { firestoreFetchCollection, firestoreFetchDoc } = useFirestoreManager()
  const collection = firestoreFetchCollection<Place>('places')
  const place = (id: string) => firestoreFetchDoc<Place>('places', id)

  return {
    collection,
    place,
    ...usePlacesSearch(),
  }
}

// Preserved for reference while we decide what to keep:
// const { firestoreFetchDoc } = useFirestoreManager()
// const place = (id: string) => firestoreFetchDoc<Place>('places', id)
// const { savePlace } = usePlaceSave()
// async function getPlaceDetails(placeId: string) {
//   const details = await fetchPlaceDetails(placeId)
//   if (!details) return null
//   return { place: details.stored, raw: details.raw }
// }
```

## composables/usePlacesGoogle.ts

```typescript
/* eslint-disable no-console */
import type { GooglePlace, Place, PlaceCard } from '../models/place.model'
import { toStoredPlace } from '../models/place.model'

const GOOGLE_AUTOCOMPLETE_ENDPOINT = '/api/places/autocomplete'

const log = (...args: unknown[]) => {
  if (import.meta.dev) {
    console.info('[places][logos]', ...args)
  }
}

export const canonicalPlaceId = (id?: string | null) =>
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
          formatted_address: secondary || desc || undefined,
          source: 'google',
          avatar: null,
        }
      })

    log('autocomplete cells resolved', {
      query,
      total: cells.length,
      immediateLogoIds: cells
        .filter((cell) => Boolean(cell.avatar))
        .map((cell) => cell.place_id),
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

export function mapDetailsToGooglePlace(
  id: string,
  result: Record<string, any>
): GooglePlace {
  const location = result?.geometry?.location ?? {}

  let phone: string | null = null
  if (typeof result?.international_phone_number === 'string') {
    phone = result.international_phone_number
  } else if (typeof result?.formatted_phone_number === 'string') {
    phone = result.formatted_phone_number
  }

  return {
    place_id: id,
    name: result?.name ?? 'Unknown place',
    formatted_address:
      result?.formatted_address ?? result?.vicinity ?? 'Unknown address',
    lat: Number(location?.lat ?? 0),
    lng: Number(location?.lng ?? 0),
    source: 'google',
    avatar: typeof result?.icon === 'string' ? result.icon : null,
    website: typeof result?.website === 'string' ? result.website : null,
    phone,
    rating: typeof result?.rating === 'number' ? result.rating : null,
    user_ratings_total:
      typeof result?.user_ratings_total === 'number'
        ? result.user_ratings_total
        : null,
  }
}

export interface PlaceDetailsResult {
  google: GooglePlace
  stored: Place
  raw: Record<string, any>
}

export async function fetchPlaceDetails(
  placeId: string
): Promise<PlaceDetailsResult | null> {
  const id = canonicalPlaceId(placeId)
  if (!id) return null

  if (typeof window === 'undefined') {
    return null
  }

  const url = new URL('/api/places/details', window.location.origin)
  url.searchParams.set('place_id', id)

  const res = await fetch(url.toString(), {
    headers: { accept: 'application/json' },
    cache: 'no-store',
  })

  if (!res.ok) {
    return null
  }

  const { result } = (await res.json()) as {
    result: Record<string, any> | null
  }

  if (!result) return null

  const google = mapDetailsToGooglePlace(id, result)
  return { google, stored: toStoredPlace(google), raw: result }
}
```

## composables/usePlaceLogos.ts

```typescript
/* eslint-disable no-console */
import { computed, ref, watch, type ComputedRef, type Ref } from 'vue'
import type { BasePlace, PlaceCard } from '../models/place.model'

const LOGO_ENDPOINT = '/api/places/logo'
const DETAILS_ENDPOINT = '/api/places/details'

const LOG_PREFIX = '[places][logos]'
const MAX_LOGO_RETRIES = 3
const RETRY_DELAY_MS = 80
const DETAILS_TIMEOUT_MS = 4000

const logoResultCache = new Map<string, string | null>()
const logoPromiseCache = new Map<string, Promise<string | null>>()
const logoAbortControllers = new Map<string, AbortController>()
const detailsResultCache = new Map<string, PlaceDetailsResult | null>()
const detailsPromiseCache = new Map<
  string,
  Promise<PlaceDetailsResult | null>
>()
const detailsAbortControllers = new Map<string, AbortController>()
let logoRequestSeq = 0
let detailsRequestSeq = 0

export const DEFAULT_LOGO_TIMEOUT_MS = 9000

export function sanitizeLogoAvatar(value?: string | null): string | null {
  if (!value) return null
  const lower = value.toLowerCase()
  if (lower.includes('mapfiles/place_api/icons')) return null
  return value
}

type PlaceLogoTarget = PlaceCard.Cell | BasePlace
type SanitizedAvatar = string | null

export interface UsePlaceLogoStateOptions {
  timeoutMs?: number
  autoHydrate?: boolean
  priority?: boolean
  retryOnEmpty?: boolean
  shouldHydrate?: (
    place: PlaceLogoTarget,
    currentAvatar: SanitizedAvatar
  ) => boolean
  emptyMessage?: string | null
}

export interface HydrateLogoOptions {
  timeoutMs?: number
  priority?: boolean
  forceReload?: boolean
  emptyMessage?: string | null
}

export interface PlaceLogoState {
  avatar: Ref<string | null>
  isLoading: Ref<boolean>
  error: Ref<string | null>
  hasAttempted: Ref<boolean>
  canHydrate: ComputedRef<boolean>
  hydrate: (overrides?: HydrateLogoOptions) => Promise<string | null>
  retry: (overrides?: HydrateLogoOptions) => Promise<string | null>
  cancel: () => void
}

export function usePlaceLogoState(
  place: Ref<PlaceLogoTarget | null>,
  options: UsePlaceLogoStateOptions = {}
): PlaceLogoState {
  const timeoutMs = options.timeoutMs ?? DEFAULT_LOGO_TIMEOUT_MS
  const retryOnEmpty = options.retryOnEmpty ?? true
  const autoHydrate = options.autoHydrate ?? true
  const basePriority = options.priority ?? false
  const emptyMessage = options.emptyMessage ?? null
  const shouldHydrate = options.shouldHydrate ?? defaultShouldHydrate

  const avatar = ref<string | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const hasAttempted = ref(false)
  let requestToken = 0

  const canHydrate = computed(() => {
    const target = place.value
    if (!target) return false
    return shouldHydrate(target, avatar.value)
  })

  watch(
    place,
    (next) => {
      requestToken += 1
      isLoading.value = false
      error.value = null
      const sanitized = sanitizeLogoAvatar(next?.avatar)
      avatar.value = sanitized
      hasAttempted.value = !!sanitized
      if (!next) return
      if (
        autoHydrate &&
        typeof window !== 'undefined' &&
        shouldHydrate(next, sanitized)
      ) {
        Promise.resolve().then(() => {
          const current = place.value
          if (!current) return
          if (shouldHydrate(current, avatar.value)) {
            void hydrate()
          }
        })
      }
    },
    { immediate: true, deep: true }
  )

  async function hydrate(
    overrides: HydrateLogoOptions = {}
  ): Promise<string | null> {
    const target = place.value
    if (!target) return avatar.value

    if (!overrides.forceReload && !shouldHydrate(target, avatar.value)) {
      hasAttempted.value = !!avatar.value
      return avatar.value
    }

    const token = ++requestToken
    isLoading.value = true
    error.value = null

    const baseOptions: LoadLogoOptions = {
      timeoutMs: overrides.timeoutMs ?? timeoutMs,
      priority: overrides.priority ?? basePriority,
    }
    if (overrides.forceReload) {
      baseOptions.forceReload = true
    }

    try {
      const attemptOptions = buildAttemptOptions(
        baseOptions,
        overrides.forceReload ?? false,
        retryOnEmpty
      )

      const { sanitized, aborted } = await executeLogoAttempts(
        target,
        attemptOptions,
        token,
        () => requestToken
      )
      if (aborted) return avatar.value

      avatar.value = sanitized
      hasAttempted.value = true
      error.value = sanitized
        ? null
        : overrides.emptyMessage ?? emptyMessage ?? null

      return avatar.value
    } catch (err) {
      if (token === requestToken) {
        hasAttempted.value = true
        error.value = formatLogoError(err)
      }
      return avatar.value
    } finally {
      if (token === requestToken) {
        isLoading.value = false
      }
    }
  }

  async function retry(
    overrides: HydrateLogoOptions = {}
  ): Promise<string | null> {
    return hydrate({
      ...overrides,
      forceReload: true,
      priority: overrides.priority ?? true,
    })
  }

  function cancel() {
    requestToken += 1
    isLoading.value = false
  }

  return {
    avatar,
    isLoading,
    error,
    hasAttempted,
    canHydrate,
    hydrate,
    retry,
    cancel,
  }
}

function defaultShouldHydrate(
  place: PlaceLogoTarget,
  currentAvatar: SanitizedAvatar
) {
  return place.source === 'google' && !currentAvatar
}

function toLogoCell(place: PlaceLogoTarget): PlaceCard.Cell {
  return {
    place_id: place.place_id,
    name: place.name,
    formatted_address: (place as PlaceCard.Cell).formatted_address ?? '',
    avatar: place.avatar ?? null,
    source: place.source,
  }
}

function formatLogoError(error: unknown): string {
  if (!error) return 'Logo fetch failed.'
  if (error instanceof Error && error.message) return error.message
  if (typeof error === 'string') return error
  try {
    return JSON.stringify(error)
  } catch {
    return 'Logo fetch failed.'
  }
}

function buildAttemptOptions(
  base: LoadLogoOptions,
  forceFirst: boolean,
  retryOnEmpty: boolean
) {
  const attempts = retryOnEmpty ? 2 : 1
  return Array.from({ length: attempts }, (_, index) => {
    const options: LoadLogoOptions = {
      ...base,
    }
    if (forceFirst || index > 0) {
      options.forceReload = true
    }
    return options
  })
}

async function executeLogoAttempts(
  place: PlaceLogoTarget,
  optionsList: LoadLogoOptions[],
  expectedToken: number,
  getToken: () => number
): Promise<{ sanitized: string | null; aborted: boolean }> {
  for (const options of optionsList) {
    const logo = await loadLogoForPlace(toLogoCell(place), options)
    if (expectedToken !== getToken()) {
      return { sanitized: null, aborted: true }
    }
    const sanitized = sanitizeLogoAvatar(logo)
    if (sanitized) {
      return { sanitized, aborted: false }
    }
  }

  if (expectedToken !== getToken()) {
    return { sanitized: null, aborted: true }
  }

  return { sanitized: null, aborted: false }
}

interface PlaceDetailsResult {
  website?: string | null
  url?: string | null
}

const canonicalPlaceId = (id?: string | null) =>
  (id ?? '').trim().replace(/^"+/, '').replace(/"+$/, '')

interface LoadLogoOptions {
  priority?: boolean
  forceReload?: boolean
  timeoutMs?: number
  fallbackAvatar?: string | null
}

export async function loadLogoForPlace(
  place: PlaceCard.Cell,
  options: LoadLogoOptions = {}
): Promise<string | null> {
  if (typeof window === 'undefined') return place.avatar ?? null
  const placeId = canonicalPlaceId(place.place_id)
  if (!placeId) return place.avatar ?? null

  const start = performanceNow()
  logEvent('load:start', {
    placeId,
    priority: !!options.priority,
    forceReload: !!options.forceReload,
    existingAvatar: sanitizeLogValue(place.avatar),
  })

  if (options.forceReload) {
    logEvent('load:force-reload', { placeId })
    logoResultCache.delete(placeId)
    cancelLogoRequest(placeId, 'force-reload')
  }

  if (logoResultCache.has(placeId)) {
    logEvent('load:cache-hit', { placeId })
    return logoResultCache.get(placeId) ?? null
  }

  if (!options.priority) {
    logEvent('load:cancel-before-refresh', { placeId })
    cancelLogoRequest(placeId)
  }

  if (logoPromiseCache.has(placeId)) {
    logEvent('load:pending-reuse', { placeId })
    return logoPromiseCache.get(placeId) ?? null
  }

  const controller = new AbortController()
  logoAbortControllers.set(placeId, controller)
  const requestId = ++logoRequestSeq
  logEvent('fetch:start', { placeId, requestId })

  const promise = fetchLogo(place, placeId, controller.signal)
    .then((url) => {
      logEvent('fetch:resolve', {
        placeId,
        requestId,
        result: sanitizeLogValue(url),
      })
      logoResultCache.set(placeId, url)
      return url
    })
    .catch((error) => {
      if (isAbortError(error)) {
        logEvent('fetch:aborted', { placeId, requestId })
        return null
      }
      logEvent('fetch:error', { placeId, requestId, error })
      throw error
    })
    .finally(() => {
      if (logoAbortControllers.get(placeId) === controller) {
        logoAbortControllers.delete(placeId)
      }
      logEvent('fetch:cleanup', {
        placeId,
        requestId,
        hasPending: logoPromiseCache.has(placeId),
        durationMs: roundDuration(performanceNow() - start),
      })
      logoPromiseCache.delete(placeId)
    })

  const timeoutMs = options.timeoutMs ?? null
  const fallbackAvatar = options.fallbackAvatar ?? (timeoutMs ? '' : null)
  let timeoutId: ReturnType<typeof setTimeout> | null = null

  const shouldApplyTimeout =
    typeof window !== 'undefined' &&
    typeof timeoutMs === 'number' &&
    timeoutMs > 0

  const timedPromise = shouldApplyTimeout
    ? Promise.race([
        promise,
        new Promise<string | null>((resolve) => {
          timeoutId = setTimeout(() => {
            if (logoAbortControllers.get(placeId) === controller) {
              const appliedFallback = fallbackAvatar ?? ''
              logEvent('fetch:timeout', {
                placeId,
                requestId,
                timeoutMs,
              })
              cancelLogoRequest(placeId, 'timeout')
              logoResultCache.set(placeId, appliedFallback)
              resolve(appliedFallback)
            } else {
              resolve(fallbackAvatar ?? null)
            }
          }, timeoutMs)
        }),
      ])
    : promise

  logoPromiseCache.set(placeId, timedPromise)

  if (shouldApplyTimeout && timeoutId) {
    timedPromise.finally(() => {
      if (timeoutId) {
        clearTimeout(timeoutId)
        timeoutId = null
      }
    })
  }

  return timedPromise
}

export function cancelLogoRequests(except?: Set<string>) {
  if (typeof window === 'undefined') return
  logEvent('cancel:bulk', {
    keep: except ? Array.from(except) : [],
    totalActive: logoAbortControllers.size,
  })
  for (const placeId of Array.from(logoAbortControllers.keys())) {
    if (except?.has(placeId)) continue
    cancelLogoRequest(placeId, 'bulk')
  }
}

function cancelLogoRequest(
  placeId: string,
  mode: 'direct' | 'bulk' | 'force-reload' | 'timeout' = 'direct'
) {
  logEvent('cancel:single', { placeId, mode })
  const controller = logoAbortControllers.get(placeId)
  if (controller) {
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
  for (let attempt = 1; attempt <= MAX_LOGO_RETRIES; attempt++) {
    const attemptStart = performanceNow()
    const allowDetails = attempt === 1
    logEvent('fetch:attempt', {
      placeId,
      attempt,
      allowDetails,
    })

    try {
      const url = await attemptLogoFetch(
        place,
        placeId,
        signal,
        allowDetails,
        attemptStart
      )
      if (url) {
        return url
      }
    } catch (error) {
      if (isAbortError(error)) {
        logEvent('fetch:attempt-abort', { placeId, attempt })
        return null
      }
      logEvent('fetch:attempt-exception', { placeId, attempt, error })
    }

    if (attempt < MAX_LOGO_RETRIES) {
      logEvent('fetch:retry-schedule', {
        placeId,
        attempt,
        delayMs: RETRY_DELAY_MS * attempt,
      })
      await delay(RETRY_DELAY_MS * attempt)
    }
  }

  return null
}

async function resolveWebsite(
  placeId: string,
  signal?: AbortSignal,
  timeoutMs = DETAILS_TIMEOUT_MS
): Promise<PlaceDetailsResult | null> {
  if (detailsResultCache.has(placeId)) {
    logEvent('details:cache-hit', { placeId })
    return detailsResultCache.get(placeId) ?? null
  }

  if (detailsPromiseCache.has(placeId)) {
    logEvent('details:pending-reuse', { placeId })
    return detailsPromiseCache.get(placeId) ?? null
  }

  cancelDetailsRequest(placeId)
  const controller = new AbortController()
  const mergedSignal = mergeSignals(signal, controller.signal)
  const requestId = ++detailsRequestSeq
  logEvent('details:start', {
    placeId,
    requestId,
    hasParentSignal: !!signal,
  })

  const timeoutId =
    timeoutMs > 0
      ? setTimeout(() => {
          if (controller.signal.aborted) return
          logEvent('details:timeout', { placeId, requestId, timeoutMs })
          controller.abort()
        }, timeoutMs)
      : null

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
        logEvent('details:response-error', {
          placeId,
          requestId,
          status: res.status,
        })
        return null
      }

      const json = await res.json()
      const result = (json?.result ?? null) as Record<string, any> | null
      if (!result) return null

      const website = normalizeUrl(result.website)
      const mapsUrl = normalizeUrl(result.url)

      logEvent('details:response-success', {
        placeId,
        requestId,
        website: sanitizeLogValue(website),
        url: sanitizeLogValue(mapsUrl),
      })
      const payload = { website, url: mapsUrl }
      detailsResultCache.set(placeId, payload)
      return payload
    } catch (error) {
      if (isAbortError(error)) {
        logEvent('details:request-abort', { placeId, requestId })
        return null
      }
      logEvent('details:request-exception', { placeId, requestId, error })
      return null
    }
  })().finally(() => {
    detailsPromiseCache.delete(placeId)
    if (detailsAbortControllers.get(placeId) === controller) {
      detailsAbortControllers.delete(placeId)
    }
    if (timeoutId) {
      clearTimeout(timeoutId)
    }
    logEvent('details:cleanup', {
      placeId,
      requestId,
      hasPending: detailsPromiseCache.has(placeId),
    })
  })

  detailsAbortControllers.set(placeId, controller)
  detailsPromiseCache.set(placeId, promise)
  return promise
}

function cancelDetailsRequest(placeId: string) {
  logEvent('details:cancel', { placeId })
  const controller = detailsAbortControllers.get(placeId)
  if (controller) {
    controller.abort()
    detailsAbortControllers.delete(placeId)
    detailsPromiseCache.delete(placeId)
  }
}

async function attemptLogoFetch(
  place: PlaceCard.Cell,
  placeId: string,
  signal: AbortSignal | undefined,
  allowDetails: boolean,
  attemptStart: number
): Promise<string | null> {
  logEvent('fetch:request-build', {
    placeId,
    formatted_address: sanitizeLogValue(place.formatted_address),
    hasSignal: !!signal,
    allowDetails,
  })

  const hint = allowDetails
    ? await resolveWebsite(placeId, signal, DETAILS_TIMEOUT_MS)
    : null

  logEvent('fetch:hint', {
    placeId,
    website: sanitizeLogValue(hint?.website),
    url: sanitizeLogValue(hint?.url),
    allowDetails,
    waitedMs: roundDuration(performanceNow() - attemptStart),
  })

  const logoUrl = new URL(LOGO_ENDPOINT, window.location.origin)
  applyLogoSearchParams(logoUrl.searchParams, place, hint)

  try {
    const res = await fetch(logoUrl.toString(), {
      headers: { accept: 'application/json' },
      signal,
    })
    if (!res.ok) {
      logEvent('fetch:response-error', {
        placeId,
        status: res.status,
      })
      return null
    }

    const json = await res.json()
    const url = typeof json?.url === 'string' ? json.url : null
    logEvent('fetch:response-success', {
      placeId,
      url: sanitizeLogValue(url),
    })
    return url
  } catch (error) {
    if (isAbortError(error)) {
      logEvent('fetch:request-abort', { placeId })
      throw error
    }
    logEvent('fetch:request-exception', { placeId, error })
    return null
  }
}

function applyLogoSearchParams(
  params: URLSearchParams,
  place: PlaceCard.Cell,
  hint: PlaceDetailsResult | null
) {
  params.set('q', place.name)

  type Candidate = { key: 'website' | 'domain'; value: string | null }
  const candidates: Candidate[] = []

  if (hint?.website) {
    candidates.push({ key: 'website', value: hint.website })
  } else if (hint?.url) {
    candidates.push({ key: 'domain', value: extractDomain(hint.url) })
  }

  candidates.push(
    { key: 'domain', value: extractDomain(place.formatted_address) },
    { key: 'domain', value: extractDomain(place.name) }
  )

  for (const candidate of candidates) {
    if (candidate.value) {
      params.set(candidate.key, candidate.value)
      break
    }
  }
}

function delay(ms: number) {
  return new Promise<void>((resolve) => {
    if (ms <= 0) {
      resolve()
      return
    }
    setTimeout(resolve, ms)
  })
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

function isAbortError(error: unknown): error is DOMException {
  return (
    !!error &&
    typeof error === 'object' &&
    'name' in error &&
    (error as { name: string }).name === 'AbortError'
  )
}

function logEvent(event: string, payload?: Record<string, unknown>) {
  const ts = new Date().toISOString()
  if (payload) {
    console.log(`${LOG_PREFIX} ${event}`, { ...payload, ts })
  } else {
    console.log(`${LOG_PREFIX} ${event}`, { ts })
  }
}

function sanitizeLogValue(value: unknown) {
  if (typeof value !== 'string') return value ?? null
  if (value.length > 120) {
    return `${value.slice(0, 117)}...`
  }
  return value
}

function performanceNow() {
  if (typeof performance !== 'undefined' && performance.now) {
    return performance.now()
  }
  return Date.now()
}

function roundDuration(value: number) {
  return Math.round(value * 10) / 10
}
```

## models/place.model.ts

```typescript
/** ───────────────────────────────
 * Base (shared by both Google & Firestore)
 * ─────────────────────────────── */
export type PlaceSource = 'google' | 'firestore'

export interface BasePlace {
  place_id: string
  name: string
  formatted_address: string
  lat: number
  lng: number
  source: PlaceSource
  avatar?: string | null
}

/** ───────────────────────────────
 * Google Place (transient)
 * ─────────────────────────────── */
export interface GooglePlace extends BasePlace {
  source: 'google'
  website?: string | null
  phone?: string | null
  rating?: number | null
  user_ratings_total?: number | null
}

/** ───────────────────────────────
 * Firestore Place (stored)
 * ─────────────────────────────── */
export interface Place extends BasePlace {
  source: 'firestore'
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
    place_id: g.place_id,
    name: g.name,
    formatted_address: g.formatted_address,
    lat: g.lat,
    lng: g.lng,
    source: 'firestore',
    avatar: g.avatar ?? null,
    search_term,
    created_at: new Date(),
  }
}

// Any place-like → Cell (UI)
export function toCell(p: BasePlace): PlaceCard.Cell {
  return {
    place_id: p.place_id,
    name: p.name,
    avatar: p.avatar ?? null,
    source: p.source,
    formatted_address: p.formatted_address,
  }
}
```
