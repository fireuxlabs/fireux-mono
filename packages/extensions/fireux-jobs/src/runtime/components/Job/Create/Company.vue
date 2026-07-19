<!-- FILE: packages/extensions/fireux-jobs/src/runtime/components/Job/Create/Company.vue -->
<template>
  <UCard>
    <template #header>
      <div class="space-y-1">
        <p class="text-sm text-muted">Step 2 · Company</p>
        <h2 class="text-lg font-semibold">
          {{ chosenPlaceCard ? 'Selected company' : 'Choose a company' }}
        </h2>
        <p class="text-sm text-muted">
          Type a company name. We create the company record if it doesn’t exist.
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
import { useCompanyCreate } from 'fireux-companies/runtime/composables/fireux/firestore/company/mutations/useCompanyCreate'
import { CompanyStorage } from 'fireux-companies/runtime/models/company.model'
import type { PlaceUpsertInput } from 'fireux-places/runtime/models/place.model'
import { computed, ref } from 'vue'
import { useFirestore } from 'fireux-core/runtime/composables/fireux/firestore/vuefire'
import type { JobCreateForm } from '../../../composables/fireux/firestore/jobs/mutations/useJobCreate'

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

  const existingSnap = await getDoc(doc(db, CompanyStorage.collection, id))
  if (!existingSnap.exists()) {
    await createCompany({ id, place })
  }

  form.value = { ...form.value, company_id: id }
  chosenPlace.value = place
  chosenPlaceId.value = id
}

// Selection is cleared by replacing the chosen place in the form;
// no explicit "Change" button shown here.
</script>
