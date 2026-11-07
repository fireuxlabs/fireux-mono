<template>
  <section>
    <UCard :ui="{ body: 'fx-card-body-stack' }">
      <template #header>
        <div class="fx-card-body-stack">
          <div>Select a place</div>
          <div>
            We’ll use the existing business if it exists, or create the record
            if it doesn’t.
          </div>
        </div>
      </template>

      <!-- section consumer -->
      <PlaceSearch @confirmed="onPlaceConfirmed" />

      <div v-if="successId">Business ready: {{ successId }}</div>
      <div v-if="error">
        {{ error }}
      </div>
    </UCard>
  </section>
</template>

<script setup lang="ts">
// Concurrent edit — 2026-07-21 14:30 CEST — Business public projection: trust idempotent server materialization without a raw existence probe.
import { ref } from 'vue'
import { useBusinessCreate } from '../../../composables/firestore/business/mutations/useBusinessCreate'

const { createBusiness, captureIntent } = useBusinessCreate()
const emit = defineEmits<{
  (e: 'created', payload: { id: string }): void
}>()

const error = ref<string | null>(null)
const successId = ref<string | null>(null)

let selectionSequence = 0
async function onPlaceConfirmed(payload: { placeId: string }) {
  const sequence = ++selectionSequence,
    contextCurrent = captureIntent()
  const isCurrent = () => contextCurrent() && sequence === selectionSequence
  error.value = null
  successId.value = null

  try {
    const id = payload.placeId
    const createdId = await createBusiness({ id })

    if (!isCurrent()) return
    successId.value = createdId
    emit('created', { id: createdId })
  } catch (e) {
    if (!isCurrent()) return
    error.value = e instanceof Error ? e.message : 'Unable to create business'
  }
}
</script>
