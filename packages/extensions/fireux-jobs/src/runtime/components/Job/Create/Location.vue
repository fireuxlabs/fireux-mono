<!-- FILE: packages/extensions/fireux-jobs/src/runtime/components/Job/Create/Location.vue -->
<!-- Concurrent edit — 2026-07-21 12:25 CEST — Neutral Jobs migration seam: materialize generic Place-backed workplaces. -->
<!-- Concurrent edit — 2026-07-21 12:52 CEST — Misebox Jobs workplace adapter: require owner materialization before recording a workplace. -->
<!-- Concurrent edit — 2026-07-22 12:39 CEST — Shared Job UI alignment: store only the ensured canonical Place reference. -->
<template>
  <UCard>
    <template #header>
      <div class="space-y-1">
        <p class="text-sm text-muted">Step 2 · Workplace</p>
        <h2 class="text-lg font-semibold">
          {{ chosenPlaceCard ? 'Selected location' : 'Choose a location' }}
        </h2>
        <p class="text-sm text-muted">
          Choose the canonical Place where the professional will work.
        </p>
      </div>
    </template>

    <div class="space-y-4">
      <UAlert
        v-if="locationError"
        color="error"
        variant="soft"
        title="Location could not be selected"
        :description="locationError"
      />

      <div v-if="!chosenPlaceCard">
        <ClientOnly>
          <PlaceSearchSection
            placeholder="Search for the workplace…"
            @confirmed="onPlaceConfirmed"
          />
        </ClientOnly>
      </div>

      <div v-else class="space-y-2">
        <PlaceCardsCell v-bind="chosenPlaceCard" :show-source="true" />
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { canonicalPlaceId } from 'fireux-places/runtime/composables/fireux/firestore/place/fetch/google/usePlacesGoogle'
import { usePlaceCreate } from 'fireux-places/runtime/composables/fireux/firestore/place/mutations/usePlaceCreate'
import type { PlaceUpsertInput } from 'fireux-places/runtime/models/place.model'
import { computed, ref } from 'vue'
import type { JobCreateForm } from '../../../composables/fireux/firestore/jobs/mutations/useJobCreate'

const form = defineModel<JobCreateForm>('form', { required: true })
const { ensurePlaceExists } = usePlaceCreate()

const chosenPlace = ref<PlaceUpsertInput | null>(null)
const chosenPlaceId = ref<string | null>(null)
const locationError = ref('')

const chosenPlaceCard = computed(() => {
  const place = chosenPlace.value
  const id = chosenPlaceId.value
  if (!place || !id) return null

  return {
    id,
    to: '',
    name: place.name ?? '',
    formattedAddress: place.formatted_address ?? '',
    imageUrl: place.assets?.image ?? '',
    source: (place.source as any) ?? 'fireux',
  }
})

async function onPlaceConfirmed(payload: {
  placeId: string
  place: PlaceUpsertInput
}) {
  locationError.value = ''
  const id = canonicalPlaceId(payload.placeId)
  const place = payload.place

  if (!id) {
    locationError.value = 'The selected Place has no canonical identifier.'
    return
  }

  try {
    const created = await ensurePlaceExists({ ...place, id })
    if (!created) {
      locationError.value = 'The selected Place could not be saved.'
      return
    }
  } catch (error) {
    locationError.value =
      error instanceof Error && error.message
        ? error.message
        : 'The selected Place could not be saved.'
    return
  }

  form.value = {
    ...form.value,
    place_id: id,
  }
  chosenPlace.value = place
  chosenPlaceId.value = id
}
</script>
