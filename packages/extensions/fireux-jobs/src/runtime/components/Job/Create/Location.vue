<!-- FILE: packages/extensions/fireux-jobs/src/runtime/components/Job/Create/Location.vue -->
<!-- Concurrent edit — 2026-07-21 12:25 CEST — Neutral Jobs migration seam: materialize generic Place-backed workplaces. -->
<!-- Concurrent edit — 2026-07-21 12:52 CEST — Misebox Jobs workplace adapter: require owner materialization before recording a workplace. -->
<template>
  <UCard>
    <template #header>
      <div class="space-y-1">
        <p class="text-sm text-muted">Step 1 · Location</p>
        <h2 class="text-lg font-semibold">
          {{ chosenPlaceCard ? 'Selected location' : 'Choose a location' }}
        </h2>
        <p class="text-sm text-muted">
          Type a location name. We store the workplace reference on the job.
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
import { canonicalPlaceId } from 'fireux-places/runtime/composables/fireux/firestore/place/fetch/google/usePlacesGoogle'
import { usePlaceCreate } from 'fireux-places/runtime/composables/fireux/firestore/place/mutations/usePlaceCreate'
import type { PlaceUpsertInput } from 'fireux-places/runtime/models/place.model'
import { computed, ref } from 'vue'
import { useFireuxJobsConfig } from '../../../composables/config/useFireuxJobsConfig'
import type { JobCreateForm } from '../../../composables/fireux/firestore/jobs/mutations/useJobCreate'
import { materializeJobWorkplace } from '../../../composables/workplace/materializeWorkplace'

const form = defineModel<JobCreateForm>('form', { required: true })
const jobsConfig = useFireuxJobsConfig()
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
    imageUrl: place.image_url ?? '',
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
  const workplaceType = String(jobsConfig.defaultWorkplaceType ?? '').trim()

  if (!id) {
    locationError.value = 'The selected Place has no canonical identifier.'
    return
  }
  if (!workplaceType) {
    locationError.value = 'Jobs default workplace type is not configured.'
    return
  }
  if (
    jobsConfig.workplaces.length > 0 &&
    !jobsConfig.workplaces.includes(workplaceType)
  ) {
    locationError.value = 'Jobs default workplace type is not allowed.'
    return
  }

  try {
    const created = await ensurePlaceExists({ ...place, id })
    if (!created) {
      locationError.value = 'The selected Place could not be materialized.'
      return
    }

    await materializeJobWorkplace({
      workplaceType,
      workplaceId: id,
      place: { ...place, id },
    })
  } catch (error) {
    locationError.value =
      error instanceof Error && error.message
        ? error.message
        : 'The selected workplace could not be materialized.'
    return
  }

  const label =
    typeof place.formatted_address === 'string'
      ? place.formatted_address
      : typeof place.name === 'string'
        ? place.name
        : ''
  form.value = {
    ...form.value,
    workplace_type: workplaceType,
    workplace_id: id,
    workplace_label: label,
  }
  chosenPlace.value = place
  chosenPlaceId.value = id
}
</script>
