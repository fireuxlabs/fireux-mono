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
        Company created: {{ successId }}
      </div>
      <div v-else-if="existingId" class="space-y-2 text-sm text-warning">
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
      <div v-if="error" class="text-sm text-error">
        {{ error }}
      </div>
    </MoleculesCreateCard>
  </section>
</template>

<script setup lang="ts">
import { doc, getDoc } from 'firebase/firestore'
import type { PlaceUpsertInput } from 'fireux-places/runtime/models/place.model'
import { ref } from 'vue'
import { useFirestore } from 'fireux-core/runtime/composables/fireux/firestore/vuefire'
import { useCompanyCreate } from '../../../composables/fireux/firestore/company/mutations/useCompanyCreate'
import { CompanyStorage } from '../../../models/company.model'

const { createCompany } = useCompanyCreate()
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

    const existingSnap = await getDoc(doc(db, CompanyStorage.collection, id))
    if (existingSnap.exists()) {
      existingId.value = id
      return
    }

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
