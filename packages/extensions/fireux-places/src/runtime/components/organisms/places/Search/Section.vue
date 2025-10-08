<template>
  <section class="space-y-3">
    <OrganismsPlacesSearchBar v-model="query" />

    <OrganismsPlacesSearchSelected
      v-if="status === 'selected' && selected"
      :place="selected"
      @clear="onClear"
      @confirm="onConfirm"
    />

    <OrganismsPlacesSearchDropdown
      v-else-if="status === 'results' && results.length"
      :cells="results"
      @select="onSelect"
    />
  </section>
</template>

<script setup lang="ts">
/* eslint-disable no-console */
import { onBeforeUnmount, ref, watch } from 'vue'
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
