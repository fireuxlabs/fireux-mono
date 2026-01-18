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
        Company created: {{ successId }}
      </div>
      <div v-else-if="existingId" class="space-y-2 text-sm text-amber-600">
        <div>Company already exists: {{ existingId }}</div>
        <UButton
          size="xs"
          variant="soft"
          color="neutral"
          :to="`/companies/${encodeURIComponent(existingId)}`"
        >
          Inspect company
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
import { useCompanyCreate } from '../../../../../composables/fireux/firestore/objects/company/mutations/useCompanyCreate'

const { createCompany } = useCompanyCreate()
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

    const existingSnap = await getDoc(doc(db, 'companies', id))
    if (existingSnap.exists()) {
      existingId.value = id
      return
    }

    const createdId = await createCompany({
      id,
      place,
      name: place.name,
      formatted_address: place.formatted_address ?? '',
      lat: place.lat ?? 0,
      lng: place.lng ?? 0,
      place_image: place.place_image ?? '',
      website: website.value.trim(),
    })

    successId.value = createdId
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Unable to create company'
  }
}
</script>
