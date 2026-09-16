<template>
  <p v-if="test.pending.value" role="status">Loading Test…</p>
  <UAlert
    v-else-if="test.error.value"
    title="Test could not be loaded"
    color="error"
  >
    <template #description><MoleculesCopyError message="Test could not be loaded" /></template>
  </UAlert>
  <UCard v-else-if="record">
    <div class="space-y-5">
      <h1 class="fx-type-card-heading">{{ record.value }}</h1>
      <TestForm
        :key="record.id"
        label="Save changes"
        :initial-value="record.value"
        :submit="update"
      />
      <MoleculesCopyError v-if="error" :message="error" />
      <UButton
        label="Delete Test"
        color="error"
        variant="soft"
        :loading="deleting"
        @click="remove"
      />
    </div>
  </UCard>
  <UAlert
    v-else
    title="Test not found"
    description="Return to Tests and choose an available record."
    color="neutral"
  />
</template>
<script setup lang="ts">
import { computed, ref } from 'vue'
import TestForm from './Form.vue'
import type { TestController } from '../../../composables/fireux/useTest'
const props = defineProps<{ test: TestController; recordId: string }>()
const record = computed(() =>
  props.test.records.value.find((row) => row.id === props.recordId)
)
const deleting = ref(false)
const error = ref('')
const update = (value: string) =>
  record.value
    ? props.test.update(record.value.id, value)
    : Promise.reject(new Error('Test not found.'))
async function remove() {
  if (!record.value || deleting.value) return
  deleting.value = true
  error.value = ''
  try {
    await props.test.remove(record.value.id)
  } catch {
    error.value =
      'Delete could not be confirmed. Check the Tests before trying again.'
  } finally {
    deleting.value = false
  }
}
</script>
