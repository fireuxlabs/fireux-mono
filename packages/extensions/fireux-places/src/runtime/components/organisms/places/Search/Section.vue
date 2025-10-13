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
