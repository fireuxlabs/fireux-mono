<template>
  <section class="space-y-4">
    <MoleculesCreateCard>
      <template #header>
        <div class="space-y-1">
          <div class="font-medium">Select a place</div>
          <div class="text-sm text-dimmed">
            We’ll use the existing company if it exists, or create the record if it doesn’t.
          </div>
        </div>
      </template>

      <!-- section consumer -->
      <PlaceSearchSection @confirmed="onPlaceConfirmed" />

      <div v-if="successId" class="text-sm text-success">
        Company ready: {{ successId }}
      </div>
      <div v-if="error" class="text-sm text-error">
        {{ error }}
      </div>
    </MoleculesCreateCard>
  </section>
</template>

<script setup lang="ts">
// Concurrent edit — 2026-07-21 14:30 CEST — Company public projection: trust idempotent server materialization without a raw existence probe.
import type { PlaceUpsertInput } from 'fireux-places/runtime/models/place.model'
import { ref } from 'vue'
import { useCompanyCreate } from '../../../composables/fireux/firestore/company/mutations/useCompanyCreate'

const { createCompany } = useCompanyCreate()

const error = ref<string | null>(null)
const successId = ref<string | null>(null)

async function onPlaceConfirmed(payload: { placeId: string; place: PlaceUpsertInput }) {
  error.value = null
  successId.value = null

  try {
    const id = payload.placeId
    const place = payload.place

    const createdId = await createCompany({
      id,
      place,
    })

    successId.value = createdId
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Unable to create company'
  }
}
</script>
