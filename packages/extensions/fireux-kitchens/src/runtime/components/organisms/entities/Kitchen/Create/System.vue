<template>
  <section class="space-y-4">
    <UCard :ui="{ body: 'space-y-4' }">
      <template #header>
        <div class="space-y-1">
          <div class="font-medium">Find a place</div>
          <div class="text-sm text-dimmed">
            Pick an existing place or confirm a new Google result.
          </div>
        </div>
      </template>

      <PlaceSearchSection @confirmed="onPlaceConfirmed" />

      <div class="space-y-2">
        <div class="text-sm font-medium">Optional</div>
        <UInput v-model="website" placeholder="Website (optional)" />
      </div>

      <div v-if="successId" class="text-sm text-green-600">
        Kitchen created: {{ successId }}
      </div>
      <div v-else-if="existingId" class="space-y-2 text-sm text-amber-600">
        <div>Kitchen already exists: {{ existingId }}</div>
        <UButton
          size="xs"
          variant="soft"
          color="neutral"
          :to="`/kitchens/${encodeURIComponent(existingId)}`"
        >
          Inspect kitchen
        </UButton>
      </div>
      <div v-if="error" class="text-sm text-red-600">
        {{ error }}
      </div>
    </UCard>
  </section>
</template>

<script setup lang="ts">
import { doc, getDoc } from 'firebase/firestore'
import type { PlaceUpsertInput } from 'fireux-places/runtime/models/objects/place.model'
import { ref } from 'vue'
import { useFirestore } from 'vuefire'
import { useKitchenCreate } from '../../../../../composables/fireux/firestore/objects/kitchen/mutations/useKitchenCreate'

const { createKitchen } = useKitchenCreate()
const db = useFirestore()

const website = ref('')
const error = ref<string | null>(null)
const successId = ref<string | null>(null)
const existingId = ref<string | null>(null)

async function onPlaceConfirmed(payload: { placeId: string; place: PlaceUpsertInput }) {
  error.value = null
  successId.value = null
  existingId.value = null

  try {
    const id = payload.placeId
    const place = payload.place

    const existingSnap = await getDoc(doc(db, 'kitchens', id))
    if (existingSnap.exists()) {
      existingId.value = id
      return
    }

    const createdId = await createKitchen({
      id,
      place,
      name: place.name,
      formatted_address: place.formatted_address ?? '',
      place_image: place.place_image ?? '',
      website: website.value.trim(),
    })

    successId.value = createdId
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Unable to create kitchen'
  }
}
</script>
