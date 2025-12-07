<template>
  <section class="space-y-4">
    <UCard class="shadow-sm" :ui="{ body: 'space-y-4' }">
      <!-- Search input -->
      <OrganismsPlacesSearchBar v-model="query" />

      <!-- Selected place -->
      <OrganismsPlacesSearchSelected
        v-if="selected"
        :place="selected"
        :confirming="isConfirming"
        @clear="clearSelection"
        @confirm="onConfirm"
      />

      <!-- Suggestions -->
      <OrganismsPlacesSearchDropdown
        v-else-if="results.length"
        :cells="results"
        @select="select"
      />

      <!-- Status messages -->
      <p v-if="isSearching" class="text-xs text-gray-500">Searching…</p>
      <p v-else-if="showEmpty" class="text-xs text-gray-500">
        No results yet—try another name.
      </p>
    </UCard>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import {
  canonicalPlaceId,
  fetchPlaceDetails,
} from '../../../../composables/usePlacesGoogle'
import { usePlaceSave } from '../../../../composables/usePlaceSave'
import { usePlacesSearch } from '../../../../composables/usePlacesSearch'
import type { BasePlace, Place } from '../../../../models/place.model'

const { query, results, selected, isSearching, select, clear } =
  usePlacesSearch()

const { ensurePlaceExists } = usePlaceSave()
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
  return /mapfiles\/place_api\/icons/i.test(value) ? null : value
}

function buildFallbackPlace(base: BasePlace, placeId: string): Place {
  const formatted = base.formatted_address ?? ''
  return {
    place_id: placeId,
    name: base.name,
    formatted_address: formatted,
    lat: base.lat,
    lng: base.lng,
    source: 'firestore',
    avatar: sanitizeAvatar(base.avatar ?? null),
    search_term: `${base.name} ${formatted}`.toLowerCase().trim(),
    created_at: new Date(),
  }
}

function clearSelection() {
  clear()
  isConfirming.value = false
}

async function loadDraftPlace(placeId: string, preview: BasePlace) {
  try {
    const details = await fetchPlaceDetails(placeId)
    if (details?.stored) {
      return {
        ...details.stored,
        place_id: placeId,
        avatar: sanitizeAvatar(details.stored.avatar ?? null),
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
  draft: Place,
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

  const placeId = canonicalPlaceId(place.place_id)
  if (!placeId) {
    if (import.meta.dev) {
      console.warn('[places][confirm] missing canonical place id', place)
    }
    selected.value = null
    return
  }

  if (place.source !== 'google') {
    if (import.meta.dev) {
      console.log('[places][confirm] skipping non-google place', place)
    }
    selected.value = null
    return
  }

  isConfirming.value = true

  try {
    const draft = await loadDraftPlace(placeId, place)
    await maybeUploadAvatar(placeId, draft, place)
    await ensurePlaceExists(draft)
  } catch (error) {
    if (import.meta.dev) {
      console.error('[places][confirm] failed to save', error)
    }
  } finally {
    isConfirming.value = false
    selected.value = null
  }
}
</script>
