<!-- FILE: packages/extensions/fireux-jobs/src/runtime/job/components/Create/Company.vue -->
<!-- Concurrent edit — 2026-07-21 14:08 CEST — Trusted Jobs API: materialize the canonical Company Place before server reference validation. -->
<template>
  <UCard>
    <template #header>
      <div class="space-y-1">
        <p class="text-sm text-muted">Step 1 · Employer</p>
        <h2 class="text-lg font-semibold">
          {{ chosenPlaceCard ? 'Selected employer' : 'Choose the employer' }}
        </h2>
        <p class="text-sm text-muted">
          Search for the organisation advertising this role. We connect it to
          the canonical Company record.
        </p>
      </div>
    </template>

    <div class="space-y-4">
      <div v-if="!chosenPlaceCard">
        <ClientOnly>
          <PlaceSearchSection
            placeholder="Search for the employer…"
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
import { useCompanyCreate } from 'fireux-companies/runtime/place/composables/firestore/company/mutations/useCompanyCreate'
import { usePlaceCreate } from 'fireux-places/runtime/place/composables/firestore/mutations/usePlaceCreate'
import type { PlaceUpsertInput } from 'fireux-places/runtime/place/models/place-onboarding.model'
import { computed, ref } from 'vue'
import type { JobCreateForm } from '../../composables/firestore/mutations/useJobCreate'

const form = defineModel<JobCreateForm>('form', { required: true })
const { createCompany } = useCompanyCreate()
const { ensurePlaceExists } = usePlaceCreate()

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

async function onPlaceConfirmed(payload: {
  placeId: string
  place: PlaceUpsertInput
}) {
  const id = payload.placeId
  const place = payload.place

  const placeExists = await ensurePlaceExists({ ...place, id })
  if (!placeExists) {
    throw new Error('The selected Company Place could not be materialized.')
  }
  await createCompany({ id })

  form.value = { ...form.value, company_id: id }
  chosenPlace.value = place
  chosenPlaceId.value = id
}

// Selection is cleared by replacing the chosen place in the form;
// no explicit "Change" button shown here.
</script>
