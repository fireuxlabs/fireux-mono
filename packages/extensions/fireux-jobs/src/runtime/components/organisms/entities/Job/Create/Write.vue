<!-- FILE: packages/extensions/fireux-jobs/src/runtime/components/Organisms/Jobs/Create/Write.vue -->
<!-- NOTE for Copilot:
  - This is the WRITE surface for job creation.
  - It must stay in sync with useJobCreate() form shape.
-->

<template>
  <div class="space-y-6">
    <UCard>
      <template #header>
        <div class="space-y-1">
          <p class="text-sm text-gray-500">Step 1 · Location</p>
          <h2 class="text-lg font-semibold">Choose the place</h2>
          <p class="text-sm text-gray-500">
            Every job must be anchored to a place. We’ll use the Place id in the record.
          </p>
        </div>
      </template>

      <div class="space-y-4">
        <PlaceSearchSection
          collection="places"
          normalized-field="search_term_normalized"
          :local-fallback="true"
          :allow-google="true"
          @confirmed="onPlaceConfirmed"
        />

        <UFormGroup label="Selected place id" required>
          <UInput v-model="form.place_id" placeholder="Place id" />
        </UFormGroup>
      </div>
    </UCard>

    <UCard>
      <template #header>
        <div class="space-y-1">
          <p class="text-sm text-gray-500">Step 2 · Job basics</p>
          <h2 class="text-lg font-semibold">Write the core details</h2>
          <p class="text-sm text-gray-500">
            Keep the title short and the description clear. The pipeline uses these fields directly.
          </p>
        </div>
      </template>

      <div class="space-y-5">
        <UFormGroup label="Job title" required>
          <UInput
            v-model="form.title"
            autofocus
            placeholder="e.g. Sous Chef (Evenings)"
            icon="i-lucide-briefcase"
          />
        </UFormGroup>

        <UFormGroup label="Job description" required>
          <UTextarea
            v-model="form.description"
            placeholder="What is the job, roughly when, and what are you looking for?"
            :rows="7"
          />
        </UFormGroup>
      </div>
    </UCard>

    <UCard>
      <template #header>
        <div class="space-y-1">
          <p class="text-sm text-gray-500">Step 3 · Links & status</p>
          <h2 class="text-lg font-semibold">Add optional links</h2>
          <p class="text-sm text-gray-500">
            Company is optional. Status defaults to open.
          </p>
        </div>
      </template>

      <div class="grid gap-5 md:grid-cols-2">
        <UFormGroup label="Company id (optional)">
          <UInput v-model="form.company_id" placeholder="Company overlay id" />
        </UFormGroup>

        <UFormGroup label="Status" required>
          <USelect v-model="form.status" :options="statusOptions" />
        </UFormGroup>
      </div>
    </UCard>
  </div>
</template>

<script setup lang="ts">
import type { PlaceUpsertInput } from 'fireux-places/runtime/models/objects/place.model'
import type { JobCreateForm } from '../../../../../composables/fireux/firestore/jobs/mutations/useJobCreate'

const statusOptions = [
  { label: 'Open', value: 'open' },
  { label: 'Closed', value: 'closed' },
]

// v-model:form connects to useJobCreate().form
const form = defineModel<JobCreateForm>('form', { required: true })

const onPlaceConfirmed = (payload: { placeId: string; place: PlaceUpsertInput }) => {
  form.value = {
    ...form.value,
    place_id: payload.placeId,
  }
}
</script>
