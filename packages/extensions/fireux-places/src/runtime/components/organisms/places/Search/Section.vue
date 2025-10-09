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
        :is-loading-logo="isLoadingLogo"
        :logo-error-message="logoErrorMessage"
        @clear="onClear"
        @confirm="onConfirm"
        @retry="onRetryLogo"
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
import {
  cancelLogoRequests,
  loadLogoForPlace,
} from '../../../../composables/usePlaceLogos'

const { searchPlaces, getPlaceDetails, savePlace } = usePlaces()
const { uploadFromUrl } = useImageStorage()
const router = useRouter()
const FLOW_PREFIX = '[places][search]'

type SearchStatus = 'idle' | 'results' | 'selected'

const props = withDefaults(
  defineProps<{
    mode?: 'manage' | 'select'
    initialQuery?: string
  }>(),
  {
    mode: 'manage',
    initialQuery: '',
  }
)

type PlacesSearchEmit = (
  event: 'place:selected',
  payload: { place: Place; cell: PlaceCard.Cell }
) => void

const emit = defineEmits<PlacesSearchEmit>()

const isSelectMode = computed(() => props.mode === 'select')

const query = ref(props.initialQuery)
const status = ref<SearchStatus>('idle')
const results = ref<PlaceCard.Cell[]>([])
const selected = ref<Place | null>(null)
const selectedCell = ref<PlaceCard.Cell | null>(null)
const isLoadingLogo = ref(false)
const logoErrorMessage = ref<string | null>(null)
let selectRequestId = 0
const LOGO_SELECTION_TIMEOUT_MS = 9000

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
    logFlow('query:changed', { value, trimmed })

    if (!trimmed) {
      logFlow('query:cleared')
      results.value = []
      selected.value = null
      status.value = 'idle'
      syncLogoRequests()
      return
    }

    debounceId = setTimeout(async () => {
      logFlow('search:execute', { query: trimmed })
      try {
        const cells = await searchPlaces(trimmed)
        results.value = cells
        selected.value = null
        status.value = 'results'
        logFlow('search:results', {
          query: trimmed,
          count: cells.length,
          placeIds: cells.map((cell) => canonicalPlaceId(cell.place_id)),
        })
        syncLogoRequests()
      } catch (error) {
        logFlow('search:error', { query: trimmed, error: formatError(error) })
        results.value = []
        status.value = 'idle'
        cancelLogoRequests()
      }
    }, debounceDelay)
  },
  { immediate: true }
)

function clearDebounce() {
  if (debounceId) {
    clearTimeout(debounceId)
    debounceId = null
    logFlow('debounce:cleared')
  }
}

async function onSelect(cell: PlaceCard.Cell) {
  const canonicalId = canonicalPlaceId(cell.place_id)
  logFlow('select:start', { placeId: canonicalId, source: cell.source })

  const place = toPreviewPlace(cell)
  selected.value = place
  selectedCell.value = { ...cell }
  status.value = 'selected'
  logoErrorMessage.value = null

  syncLogoRequests([cell.place_id])

  if (cell.source !== 'google') {
    logFlow('select:skip-logo', {
      reason: 'non-google-source',
      placeId: canonicalId,
    })
    isLoadingLogo.value = false
    return
  }

  void fetchSelectedLogo()
}

async function fetchSelectedLogo(options: { forceReload?: boolean } = {}) {
  if (!selectedCell.value) return

  const cell = selectedCell.value
  const canonicalId = canonicalPlaceId(cell.place_id)
  const requestId = ++selectRequestId
  const timeoutToken = Symbol('logo-timeout')
  let timeoutId: ReturnType<typeof setTimeout> | null = null

  try {
    isLoadingLogo.value = true
    logoErrorMessage.value = null
    logFlow('select:logo-load:start', {
      placeId: canonicalId,
      requestId,
      forceReload: !!options.forceReload,
    })

    const fetchPromise = loadLogoForPlace(cell, {
      priority: true,
      ...(options.forceReload ? { forceReload: true } : {}),
    })

    const timeoutPromise =
      LOGO_SELECTION_TIMEOUT_MS > 0
        ? new Promise<typeof timeoutToken>((resolve) => {
            timeoutId = setTimeout(() => {
              resolve(timeoutToken)
            }, LOGO_SELECTION_TIMEOUT_MS)
          })
        : null

    const raceResult = timeoutPromise
      ? await Promise.race([fetchPromise, timeoutPromise])
      : await fetchPromise

    if (timeoutId) {
      clearTimeout(timeoutId)
      timeoutId = null
    }

    if (raceResult === timeoutToken) {
      if (requestId !== selectRequestId) return

      logFlow('select:logo-load:timeout', {
        placeId: canonicalId,
        requestId,
        timeoutMs: LOGO_SELECTION_TIMEOUT_MS,
      })

      isLoadingLogo.value = false
      logoErrorMessage.value =
        'Fetching the logo is taking longer than expected. Try again or upload one manually from the dashboard.'

      fetchPromise
        .then((lateLogo) => {
          if (requestId !== selectRequestId) return
          const sanitizedLate = sanitizeAvatar(lateLogo)
          if (!sanitizedLate) return
          logFlow('select:logo-load:late-success', {
            placeId: canonicalId,
            requestId,
            avatar: truncate(sanitizedLate),
          })
          applySelectedAvatar(cell, sanitizedLate)
          logoErrorMessage.value = null
        })
        .catch((error) => {
          if (requestId !== selectRequestId) return
          logFlow('select:logo-load:late-error', {
            placeId: canonicalId,
            requestId,
            error: formatError(error),
          })
        })

      return
    }

    if (requestId !== selectRequestId) {
      logFlow('select:logo-load:stale', {
        placeId: canonicalId,
        requestId,
      })
      return
    }

    const sanitized = sanitizeAvatar(raceResult)

    if (!sanitized) {
      logFlow('select:logo-load:empty', {
        placeId: canonicalId,
        requestId,
      })
      logoErrorMessage.value =
        'We could not fetch a logo automatically. You can upload one from the dashboard or try again.'
      return
    }

    logFlow('select:logo-load:success', {
      placeId: canonicalId,
      requestId,
      avatar: truncate(sanitized),
    })

    applySelectedAvatar(cell, sanitized)
    logoErrorMessage.value = null
  } catch (error) {
    if (requestId !== selectRequestId) {
      return
    }
    logFlow('select:logo-load:error', {
      placeId: canonicalId,
      requestId,
      error: formatError(error),
    })
    logoErrorMessage.value =
      'Fetching the logo timed out. Try again or upload a logo manually from the dashboard.'
  } finally {
    if (requestId === selectRequestId) {
      isLoadingLogo.value = false
      logFlow('select:logo-load:complete', {
        placeId: canonicalId,
        requestId,
      })
    }
  }
}

function onClear() {
  logFlow('selection:cleared')
  selected.value = null
  selectedCell.value = null
  status.value = 'results'
  selectRequestId += 1
  isLoadingLogo.value = false
  logoErrorMessage.value = null
  syncLogoRequests()
}

function onRetryLogo() {
  if (isLoadingLogo.value) {
    logFlow('select:retry:skip-busy')
    return
  }
  logFlow('select:retry:start')
  void fetchSelectedLogo({ forceReload: true })
}

async function onConfirm(place: Place) {
  const placeId = canonicalPlaceId(place.place_id)
  logFlow('confirm:start', {
    placeId,
    source: selectedCell.value?.source,
    mode: props.mode,
  })

  const cell = selectedCell.value

  if (!cell || !placeId) {
    logFlow('confirm:skip', { reason: 'missing-context' })
    selected.value = null
    selectedCell.value = null
    status.value = results.value.length ? 'results' : 'idle'
    return
  }

  if (cell.source === 'google' && isLoadingLogo.value) {
    logFlow('confirm:await-logo', { placeId })
    await waitForLogoLoad()
  }

  try {
    if (cell.source === 'google') {
      logFlow('confirm:path', {
        placeId,
        path: 'google',
        mode: props.mode,
      })
      const savedPlace = await confirmGooglePlace(placeId, place, cell, {
        skipNavigate: isSelectMode.value,
      })
      if (isSelectMode.value) {
        emitSelection(placeId, selectedCell.value ?? cell, savedPlace)
      }
    } else {
      logFlow('confirm:path', {
        placeId,
        path: 'firestore',
        mode: props.mode,
      })
      if (isSelectMode.value) {
        const preview = selected.value ?? toPreviewPlace(cell)
        emitSelection(placeId, selectedCell.value ?? cell, preview)
      } else {
        await goToPlace(placeId)
      }
    }
  } catch (error) {
    logFlow('confirm:error', { placeId, error: formatError(error) })
  } finally {
    selected.value = null
    selectedCell.value = null
    status.value = results.value.length ? 'results' : 'idle'
    syncLogoRequests()
    logFlow('confirm:complete', { placeId })
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

function emitSelection(placeId: string, cell: PlaceCard.Cell, place: Place) {
  const canonicalId = canonicalPlaceId(placeId)
  const payloadCell: PlaceCard.Cell = {
    ...cell,
    place_id: canonicalId,
    avatar: cell.avatar ?? place.avatar ?? null,
  }

  const formattedAddress = place.formatted_address ?? ''
  const normalizedSearch = `${place.name ?? ''} ${formattedAddress}`
    .toLowerCase()
    .trim()

  const payloadPlace: Place = {
    ...place,
    place_id: canonicalId,
    avatar: place.avatar ?? payloadCell.avatar ?? null,
    source: 'firestore',
    search_term: place.search_term ?? normalizedSearch,
    created_at: place.created_at ?? new Date(),
  }

  emit('place:selected', {
    place: payloadPlace,
    cell: payloadCell,
  })

  logFlow('confirm:emit', {
    placeId: canonicalId,
    mode: props.mode,
  })
}

async function goToPlace(placeId: string) {
  const id = canonicalPlaceId(placeId)
  if (!id) return
  try {
    logFlow('navigate:start', { placeId: id })
    await router.push(`/places/${id}`)
    logFlow('navigate:success', { placeId: id })
  } catch (error) {
    logFlow('navigate:error', { placeId: id, error: formatError(error) })
  }
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
      logFlow('details:success', { placeId, source: 'firestore' })
      return {
        ...details.place,
        place_id: placeId,
        created_at: details.place.created_at ?? new Date(),
      }
    }
  } catch (error) {
    logFlow('details:error', { placeId, error: formatError(error) })
  }

  logFlow('details:fallback', { placeId })
  return buildFallbackPlace(place, cell, placeId)
}

async function confirmGooglePlace(
  placeId: string,
  place: Place,
  cell: PlaceCard.Cell,
  options: { skipNavigate?: boolean } = {}
): Promise<Place> {
  logFlow('confirm-google:start', { placeId })
  let draft = await resolvePlaceForConfirmation(placeId, place, cell)
  const uploadSource = resolveUploadSource(cell, draft)

  if (uploadSource) {
    try {
      const avatarPath = `places/${placeId}/avatar`
      logFlow('upload:start', { placeId, avatarPath })
      draft = {
        ...draft,
        avatar: await uploadFromUrl(avatarPath, uploadSource),
      }
      logFlow('upload:success', { placeId, avatarPath })
    } catch (error) {
      logFlow('upload:error', { placeId, error: formatError(error) })
    }
  } else {
    logFlow('upload:skip', { placeId })
    draft = {
      ...draft,
      avatar: null,
    }
  }

  await savePlace(draft)
  logFlow('confirm-google:saved', { placeId })
  if (!options.skipNavigate) {
    await goToPlace(placeId)
  }

  return draft
}

function resolveUploadSource(cell: PlaceCard.Cell, draft: Place) {
  const preferred = sanitizeAvatar(cell.avatar)
  if (preferred) return preferred
  return sanitizeAvatar(draft.avatar)
}

function applyAvatarToResults(placeId: string, avatar: string) {
  const targetId = canonicalPlaceId(placeId)
  const index = results.value.findIndex(
    (item) => canonicalPlaceId(item.place_id) === targetId
  )

  if (index === -1) {
    logFlow('results:avatar-skip', { placeId: targetId })
    return
  }

  results.value[index] = {
    ...results.value[index],
    avatar,
  }

  logFlow('results:avatar-applied', {
    placeId: targetId,
    index,
    avatar: truncate(avatar),
  })
}

function applySelectedAvatar(cell: PlaceCard.Cell, avatar: string) {
  const preview = selected.value ?? toPreviewPlace(cell)
  selected.value = {
    ...preview,
    avatar,
  }

  selectedCell.value = {
    ...cell,
    avatar,
  }

  applyAvatarToResults(cell.place_id, avatar)
}

function sanitizeAvatar(value?: string | null): string | null {
  if (!value) return null
  const lower = value.toLowerCase()
  if (lower.includes('mapfiles/place_api/icons')) return null
  return value
}

async function waitForLogoLoad(timeout = 1500) {
  if (!isLoadingLogo.value) return

  logFlow('logo-wait:start', { timeout })
  await new Promise<void>((resolve) => {
    const start = performance.now()
    const check = () => {
      if (!isLoadingLogo.value || performance.now() - start >= timeout) {
        resolve()
        return
      }
      requestAnimationFrame(check)
    }
    requestAnimationFrame(check)
  })
  logFlow('logo-wait:complete')
}

onBeforeUnmount(() => {
  logFlow('component:unmounted')
  clearDebounce()
  cancelLogoRequests()
})

defineExpose({
  query,
  status,
  results,
  selected,
  isLoadingLogo,
})

function syncLogoRequests(extra?: (string | null | undefined)[]) {
  if (typeof window === 'undefined') return

  const keep = new Set<string>()

  if (status.value !== 'selected') {
    for (const cell of results.value) {
      const id = canonicalPlaceId(cell.place_id)
      if (id) keep.add(id)
    }
  }

  const selectedId = canonicalPlaceId(selectedCell.value?.place_id)
  if (selectedId) keep.add(selectedId)

  if (extra) {
    for (const id of extra) {
      const canonical = canonicalPlaceId(id)
      if (canonical) keep.add(canonical)
    }
  }

  if (keep.size === 0) {
    logFlow('logos:sync', { keep: [], resultCount: 0, hasSelected: false })
    cancelLogoRequests()
    return
  }

  cancelLogoRequests(keep)
  logFlow('logos:sync', {
    keep: Array.from(keep),
    resultCount: results.value.length,
    hasSelected: !!selectedCell.value,
  })
}

function logFlow(event: string, payload?: Record<string, unknown>) {
  const ts = new Date().toISOString()
  if (payload) {
    console.log(`${FLOW_PREFIX} ${event}`, { ...payload, ts })
  } else {
    console.log(`${FLOW_PREFIX} ${event}`, { ts })
  }
}

function truncate(value?: string | null) {
  if (!value) return value ?? null
  return value.length > 120 ? `${value.slice(0, 117)}...` : value
}

function formatError(error: unknown) {
  if (!error || typeof error !== 'object') return error ?? null
  const { name, message, stack } = error as Error
  return { name, message, stack }
}
</script>
