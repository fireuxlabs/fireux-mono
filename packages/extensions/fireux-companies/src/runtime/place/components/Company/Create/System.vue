<template>
  <section class="space-y-4">
    <UCard :ui="{ body: 'fx-card-body-stack' }">
      <template #header>
        <div class="space-y-1">
          <div class="font-medium">Select a place</div>
          <div class="text-sm text-dimmed">
            We’ll use the existing company if it exists, or create the record if
            it doesn’t.
          </div>
        </div>
      </template>

      <!-- section consumer -->
      <PlaceSearch @confirmed="onPlaceConfirmed" />

      <div v-if="successId" class="text-sm text-success">
        Company ready: {{ successId }}
      </div>
      <div v-if="error" class="text-sm text-error">
        {{ error }}
      </div>
    </UCard>
  </section>
</template>

<script setup lang="ts">
// Concurrent edit — 2026-07-21 14:30 CEST — Company public projection: trust idempotent server materialization without a raw existence probe.
import { ref } from 'vue'
import { useCompanyCreate } from '../../../composables/firestore/company/mutations/useCompanyCreate'

const { createCompany, captureIntent } = useCompanyCreate()
const emit = defineEmits<{
  (e: 'created', payload: { id: string }): void
}>()

const error = ref<string | null>(null)
const successId = ref<string | null>(null)

let selectionSequence = 0
async function onPlaceConfirmed(payload: { placeId: string }) {
  const sequence = ++selectionSequence, contextCurrent = captureIntent()
  const isCurrent = () => contextCurrent() && sequence === selectionSequence
  error.value = null
  successId.value = null

  try {
    const id = payload.placeId
    const createdId = await createCompany({ id })

    if (!isCurrent()) return
    successId.value = createdId
    emit('created', { id: createdId })
  } catch (e) {
    if (!isCurrent()) return
    error.value = e instanceof Error ? e.message : 'Unable to create company'
  }
}
</script>
