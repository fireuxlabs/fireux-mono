<!-- FILE: packages/extensions/fireux-jobs/src/runtime/job/components/Create/Business.vue -->
<!-- Concurrent edit — 2026-07-21 14:08 CEST — Trusted Jobs API: materialize the canonical Business Place before server reference validation. -->
<template>
  <UCard>
    <template #header>
      <div class="fx-card-body-stack">
        <p>Step 1 · Employer</p>
        <h2 class="fx-type-card-heading">
          {{ chosenPlaceCard ? 'Selected employer' : 'Choose the employer' }}
        </h2>
        <p>
          Search for the organisation advertising this role. We connect it to
          the canonical Business record.
        </p>
      </div>
    </template>

    <div class="fx-card-body-stack">
      <div v-if="!chosenPlaceCard">
        <ClientOnly>
          <PlaceSearch
            placeholder="Search for the employer…"
            @confirmed="onPlaceConfirmed"
          />
        </ClientOnly>
      </div>

      <div v-else class="fx-card-body-stack">
        <PlaceCardsCell v-bind="chosenPlaceCard" :show-source="true" />
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { useBusinessCreate } from 'fireux-businesses/runtime/business/composables/firestore/business/mutations/useBusinessCreate'
import { usePlaceCreate } from 'fireux-places/runtime/place/composables/firestore/mutations/usePlaceCreate'
import type { PlaceUpsertInput } from 'fireux-places/runtime/place/models/place-onboarding.model'
import { computed, ref } from 'vue'
import type { JobCreateForm } from '../../composables/firestore/mutations/useJobCreate'

const form = defineModel<JobCreateForm>('form', { required: true })
const { createBusiness } = useBusinessCreate()
const { ensurePlaceExists, captureIntent } = usePlaceCreate({
  sources: [() => form.value],
})

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
    imageUrl: place.image_url ?? '',
    source: 'fireux' as const,
  }
})

let selectionSequence = 0
async function onPlaceConfirmed(payload: {
  placeId: string
  place: PlaceUpsertInput
}) {
  const sequence = ++selectionSequence,
    contextCurrent = captureIntent()
  const isCurrent = () => contextCurrent() && sequence === selectionSequence
  payload = JSON.parse(JSON.stringify(payload))
  const id = payload.placeId
  const place = payload.place

  const placeExists = await ensurePlaceExists({ ...place, id })
  if (!placeExists) {
    throw new Error('The selected Business Place could not be materialized.')
  }
  if (!isCurrent()) return
  await createBusiness({ id })
  if (!isCurrent()) return

  form.value = { ...form.value, business_id: id }
  chosenPlace.value = place
  chosenPlaceId.value = id
}

// Selection is cleared by replacing the chosen place in the form;
// no explicit "Change" button shown here.
</script>
