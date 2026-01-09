<template>
  <section class="space-y-4">
    <UCard :ui="{ body: 'space-y-4' }">
      <!-- Search input -->
      <OrganismsObjectsPlaceSearchBar v-model="query" />

      <!-- Selected place -->
      <OrganismsObjectsPlaceSearchSelected
        v-if="selected"
        :place="selected"
        :confirming="isConfirming"
        @clear="clearSelection"
        @confirm="onConfirm"
      />

      <!-- Suggestions -->
      <OrganismsObjectsPlaceSearchDropdown
        v-else-if="results.length"
        :cells="results"
        @select="select"
      />

      <!-- Status messages -->
      <p v-if="isSearching" class="text-xs text-muted">Searching…</p>
      <p v-else-if="showEmpty" class="text-xs text-muted">
        No results yet—try another name.
      </p>
    </UCard>

    <DevJsonPanel
      v-if="showDebug"
      title="Places Search Debug"
      :data="debugPayload"
    />
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useImageStorage } from 'fireux-core/runtime/composables/fireux/firebase/useImageStorage.ts'
import DevJsonPanel from 'fireux-core/runtime/components/dev/JsonPanel.vue'
import {
  canonicalPlaceId,
  fetchPlaceDetails,
} from '../../../../../composables/fireux/firestore/objects/place/fetch/google/usePlacesGoogle'
import { usePlaceSave } from '../../../../../composables/fireux/firestore/objects/place/mutations/usePlaceSave'
import { usePlacesSearch } from '../../../../../composables/fireux/firestore/objects/place/fetch/search/usePlacesSearch'
import type { BasePlace, PlaceUpsertInput } from '../../../../../models/place.model'

interface Props {
  type?: string | null
}

const props = withDefaults(defineProps<Props>(), {
  type: null,
})

const emit = defineEmits<{
  (e: 'confirmed', payload: { placeId: string; place: PlaceUpsertInput }): void
}>()

const { query, results, selected, isSearching, select, clear, debug } =
  usePlacesSearch({ type: props.type })

const showDebug = import.meta.dev

const debugPayload = computed(() => {
  const resultsBySource = (results.value ?? []).reduce(
    (acc: Record<string, number>, row) => {
      const key = row.source
      acc[key] = (acc[key] ?? 0) + 1
      return acc
    },
    {}
  )

  return {
    query: query.value,
    isSearching: isSearching.value,
    resultsCount: results.value.length,
    resultsBySource,
    selected: selected.value
      ? {
          id: selected.value.id,
          source: selected.value.source,
          name: selected.value.name,
        }
      : null,
    decision: debug.value ?? null,
  }
})

const { ensurePlaceExists } = usePlaceSave({ type: props.type })
// useImageStorage is auto-imported by fireux-core module
const { uploadFromUrl } = useImageStorage()

const isConfirming = ref(false)

const showEmpty = computed(
  () =>
    !isSearching.value &&
    !selected.value &&
    query.value.trim().length > 0 &&
    results.value.length === 0
)

function sanitizeAvatar(value?: string | null) {
  if (!value) return null
  const trimmed = String(value).trim()
  return trimmed ? trimmed : null
}

function buildFallbackPlace(base: BasePlace, placeId: string): PlaceUpsertInput {
  const formatted = base.formatted_address ?? ''
  return {
    id: placeId,
    source: 'firebase',
    name: base.name,
    formatted_address: formatted,
    lat: base.lat,
    lng: base.lng,
    avatar: sanitizeAvatar(base.avatar ?? null) ?? '',
    search_term: `${base.name} ${formatted}`.toLowerCase().trim(),
  }
}

function clearSelection() {
  clear()
  isConfirming.value = false
}

async function loadDraftPlace(placeId: string, preview: BasePlace): Promise<PlaceUpsertInput> {
  try {
    const details = await fetchPlaceDetails(placeId)
    if (details?.stored) {
      return {
        ...details.stored,
        id: placeId,
        avatar: sanitizeAvatar(details.stored.avatar ?? null) ?? '',
      }
    }
  } catch (error) {
    if (import.meta.dev) {
      console.warn('[places][confirm] details fetch failed', error)
    }
  }

  return buildFallbackPlace(preview, placeId)
}

async function maybeUploadAvatar(
  placeId: string,
  draft: PlaceUpsertInput,
  preview: BasePlace
) {
  const uploadSource = sanitizeAvatar(preview.avatar ?? draft.avatar ?? null)
  if (!uploadSource) return

  try {
    const path = `places/${placeId}/avatar`
    const uploadedUrl = await uploadFromUrl(path, uploadSource)
    draft.avatar = uploadedUrl
    if (selected.value) {
      selected.value = {
        ...selected.value,
        avatar: uploadedUrl,
      }
    }
  } catch (error) {
    if (import.meta.dev) {
      console.warn('[places][confirm] avatar upload failed', error)
    }
  }
}

async function onConfirm(place: BasePlace) {
  if (isConfirming.value) return

  const placeId = canonicalPlaceId((place as any).id ?? (place as any).place_id)
  if (!placeId) {
    if (import.meta.dev) {
      console.warn('[places][confirm] missing canonical place id', place)
    }
    selected.value = null
    return
  }

  isConfirming.value = true

  try {
    // If the user selects an existing Firebase place, allow confirmation
    // so downstream overlays (companies/kitchens/etc) can be created.
    if (place.source === 'firebase') {
      const draft: PlaceUpsertInput = {
        id: placeId,
        source: 'firebase',
        name: place.name,
        formatted_address: place.formatted_address ?? '',
        lat: place.lat,
        lng: place.lng,
        avatar: sanitizeAvatar(place.avatar ?? null) ?? '',
        search_term:
          (place as any).search_term ??
          `${place.name} ${place.formatted_address ?? ''}`.toLowerCase().trim(),
      }

      await ensurePlaceExists(draft)
      emit('confirmed', { placeId, place: draft })
      return
    }

    if (place.source !== 'google') {
      if (import.meta.dev) {
        console.log('[places][confirm] skipping unknown place source', place)
      }
      return
    }

    const draft = await loadDraftPlace(placeId, place)
    await maybeUploadAvatar(placeId, draft, place)
    await ensurePlaceExists(draft)
    emit('confirmed', { placeId, place: draft })
  } catch (error) {
    if (import.meta.dev) {
      console.error('[places][confirm] failed to confirm', error)
    }
  } finally {
    isConfirming.value = false
    selected.value = null
  }
}
</script>
