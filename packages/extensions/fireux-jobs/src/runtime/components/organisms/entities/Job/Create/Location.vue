<!-- FILE: packages/extensions/fireux-jobs/src/runtime/components/organisms/entities/Job/Create/Location.vue -->
<template>
  <UCard>
    <template #header>
      <div class="space-y-1">
        <p class="text-sm text-gray-500">Step 1 · Location</p>
        <h2 class="text-lg font-semibold">
          {{ chosenPlaceCard ? 'Selected place' : 'Choose a place' }}
        </h2>
        <p class="text-sm text-gray-500">
          Type a location name. We store the Place id on the job.
        </p>
      </div>
    </template>

    <div class="space-y-4">
      <div v-if="!chosenPlaceCard">
        <ClientOnly>
          <PlaceSearchSection @confirmed="onPlaceConfirmed" />
        </ClientOnly>
      </div>

      <div v-else class="space-y-2">
        <PlaceCardsCell v-bind="chosenPlaceCard" :show-source="true" />
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import type { PlaceUpsertInput } from 'fireux-places/runtime/models/objects/place.model'
import { computed, ref } from 'vue'
import type { JobCreateForm } from '../../../../../composables/fireux/firestore/jobs/mutations/useJobCreate'

const form = defineModel<JobCreateForm>('form', { required: true })

const chosenPlace = ref<PlaceUpsertInput | null>(null)
const chosenPlaceId = ref<string | null>(null)

const chosenPlaceCard = computed(() => {
  const place = chosenPlace.value
  const id = chosenPlaceId.value
  if (!place || !id) return null

  return {
    id,
    to: '',
    name: place.name ?? '',
    formattedAddress: place.formatted_address ?? '',
    imageUrl: place.place_image ?? '',
    source: (place.source as any) ?? 'fireux',
  }
})

function onPlaceConfirmed(payload: { placeId: string; place: PlaceUpsertInput }) {
  const id = payload.placeId
  const place = payload.place

  form.value = { ...form.value, place_id: id }
  chosenPlace.value = place
  chosenPlaceId.value = id
}
</script>
