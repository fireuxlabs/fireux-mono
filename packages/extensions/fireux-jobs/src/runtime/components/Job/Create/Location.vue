<!-- FILE: packages/extensions/fireux-jobs/src/runtime/components/Job/Create/Location.vue -->
<template>
  <UCard>
    <template #header>
      <div class="space-y-1">
        <p class="text-sm text-gray-500">Step 1 · Location</p>
        <h2 class="text-lg font-semibold">
          {{ chosenPlaceCard ? 'Selected location' : 'Choose a location' }}
        </h2>
        <p class="text-sm text-gray-500">
          Type a location name. We store the workplace reference on the job.
        </p>
      </div>
    </template>

    <div class="space-y-4">
      <div v-if="!chosenPlaceCard">
        <ClientOnly>
          <PlaceSearchSection
            placeholder="Type a location name…"
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
import { doc, getDoc } from 'firebase/firestore'
import { useKitchenCreate } from 'fireux-kitchens/runtime/composables/fireux/firestore/kitchen/mutations/useKitchenCreate'
import { KitchenStorage } from 'fireux-kitchens/runtime/models/kitchen.model'
import type { PlaceUpsertInput } from 'fireux-places/runtime/models/place.model'
import { computed, ref } from 'vue'
import { useFirestore } from 'fireux-core/runtime/composables/fireux/firestore/vuefire'
import type { JobCreateForm } from '../../../composables/fireux/firestore/jobs/mutations/useJobCreate'

const form = defineModel<JobCreateForm>('form', { required: true })
const db = useFirestore()
const { createKitchen } = useKitchenCreate()

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

  void createKitchenIfMissing(id, place)
}

async function createKitchenIfMissing(id: string, place: PlaceUpsertInput) {
  const existingSnap = await getDoc(doc(db, KitchenStorage.rootCollection, id))
  if (!existingSnap.exists()) {
    await createKitchen({ id, place })
  }

  const label =
    typeof place.formatted_address === 'string'
      ? place.formatted_address
      : typeof place.name === 'string'
        ? place.name
        : ''
  form.value = {
    ...form.value,
    workplace_type: 'kitchen',
    workplace_id: id,
    workplace_label: label,
  }
  chosenPlace.value = place
  chosenPlaceId.value = id
}
</script>
