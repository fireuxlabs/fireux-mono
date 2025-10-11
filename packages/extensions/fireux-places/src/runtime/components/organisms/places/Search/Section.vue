<template>
  <section class="space-y-4">
    <UCard class="shadow-sm" :ui="{ body: 'space-y-4' }">
      <OrganismsPlacesSearchBar v-model="query" />

      <template v-if="selected">
        <OrganismsPlacesSearchSelected
          :place="selected"
          :saving="isSaving"
          :disabled="!isAuthenticated"
          @clear="handleClear"
          @confirm="handleConfirm"
        />

        <p v-if="!isAuthenticated" class="text-xs text-rose-600">
          You need to sign in before saving places.
        </p>
        <p v-else-if="saveError" class="text-xs text-rose-600">
          {{ saveError }}
        </p>
        <p v-else-if="saveSuccess" class="text-xs text-emerald-600">
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
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import type { BasePlace, Place } from '../../../../models/place.model'
import { usePlacesSearchVm } from '../../../../composables/usePlacesSearch'
import { usePlaceSave } from '../../../../composables/usePlaceSave'
import {
  canonicalPlaceId,
  fetchPlaceDetails,
} from '../../../../composables/usePlacesGoogle'
import { useAuth } from '#imports'

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

watch(selected, (next) => {
  saveError.value = null
  if (next) {
    saveSuccess.value = false
    clearSuccessTimer()
  }
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

  if (!isAuthenticated.value) {
    saveError.value = 'Sign in to save places.'
    return
  }

  const canonicalId = canonicalPlaceId(place.place_id)
  if (!canonicalId) {
    saveError.value = 'Cannot save place without a valid identifier.'
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
    clearSelected()
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
  clearSelected()
  saveError.value = null
  saveSuccess.value = false
  clearSuccessTimer()
}

onBeforeUnmount(() => {
  clearSuccessTimer()
})
</script>
