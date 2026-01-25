<template>
  <section class="space-y-4">
    <UCard :ui="{ body: 'space-y-4' }">
      <template #header>
        <div class="space-y-1">
          <div class="font-medium">Select a place</div>
          <div class="text-sm text-dimmed">
            We’ll use the existing kitchen if it exists, or create the overlay if it doesn’t.
          </div>
        </div>
      </template>

      <!-- section consumer -->
      <PlaceSearchSection type="kitchen" @confirmed="onPlaceConfirmed" />

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
import { usePlaceSave } from 'fireux-places/runtime/composables/fireux/firestore/objects/place/mutations/usePlaceSave'
import type { PlaceUpsertInput } from 'fireux-places/runtime/models/objects/place.model'
import { ref } from 'vue'
import { useFirestore } from 'vuefire'
import { useKitchenCreate } from '../../../../../composables/fireux/firestore/objects/kitchen/mutations/useKitchenCreate'
import { useKitchenUpdate } from '../../../../../composables/fireux/firestore/objects/kitchen/mutations/useKitchenUpdate'

const { createKitchen } = useKitchenCreate()
const { updateKitchen } = useKitchenUpdate()
const { ensurePlaceExists } = usePlaceSave()
const db = useFirestore()

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
    let placeForOverlay = place

    await ensurePlaceExists(placeForOverlay)

    const placeSnap = await getDoc(doc(db, 'places', id))
    if (placeSnap.exists()) {
      const stored = placeSnap.data() as Record<string, any>
      placeForOverlay = {
        ...place,
        ...stored,
        id,
      }
    }

    const existingSnap = await getDoc(doc(db, 'kitchens', id))
    if (existingSnap.exists()) {
      existingId.value = id
      return
    }

    const createdId = await createKitchen({
      id,
      place: placeForOverlay,
      website: '',
    })

    successId.value = createdId
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Unable to create kitchen'
  }
}
</script>
