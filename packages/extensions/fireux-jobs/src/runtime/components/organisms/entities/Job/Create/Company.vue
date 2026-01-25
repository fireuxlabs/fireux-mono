<!-- FILE: packages/extensions/fireux-jobs/src/runtime/components/organisms/entities/Job/Create/Company.vue -->
<template>
  <UCard>
    <template #header>
      <div class="space-y-1">
        <p class="text-sm text-gray-500">Step 2 · Company</p>
        <h2 class="text-lg font-semibold">
          {{ chosenPlaceCard ? 'Selected company' : 'Choose a company' }}
        </h2>
        <p class="text-sm text-gray-500">
          Type a company name. We create the company overlay if it doesn’t exist.
        </p>
      </div>
    </template>

    <div class="space-y-4">
      <div v-if="!chosenPlaceCard">
        <ClientOnly>
          <PlaceSearchSection
            placeholder="Type a company name…"
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
import { useCompanyCreate } from 'fireux-companies/runtime/composables/fireux/firestore/objects/company/mutations/useCompanyCreate'
import type { PlaceUpsertInput } from 'fireux-places/runtime/models/objects/place.model'
import { computed, ref } from 'vue'
import { useFirestore } from 'vuefire'
import type { JobCreateForm } from '../../../../../composables/fireux/firestore/jobs/mutations/useJobCreate'

const form = defineModel<JobCreateForm>('form', { required: true })
const db = useFirestore()
const { createCompany } = useCompanyCreate()

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

async function onPlaceConfirmed(payload: { placeId: string; place: PlaceUpsertInput }) {
  const id = payload.placeId
  const place = payload.place

  const existingSnap = await getDoc(doc(db, 'companies', id))
  if (!existingSnap.exists()) {
    await createCompany({ id, place, website: '' })
  }

  form.value = { ...form.value, company_id: id }
  chosenPlace.value = place
  chosenPlaceId.value = id
}

// Selection is cleared by replacing the chosen place in the form;
// no explicit "Change" button shown here.
</script>
