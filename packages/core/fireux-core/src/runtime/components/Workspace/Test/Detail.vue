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
        :capture-intent="test.captureIntent"
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
import { computed, ref, watch } from 'vue'
import { useCommandScope } from '../../../composables/fireux/commands/useCommandScope'
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
const capture = useCommandScope([() => props.recordId, () => props.test.id.value, () => props.test])
watch([() => props.recordId, () => props.test.id.value], () => { deleting.value = false; error.value = '' }, { flush: 'sync' })
async function remove() {
  if (!record.value || deleting.value) return
  const local = capture()
  const owner = props.test.captureIntent()
  const isCurrent = () => local() && owner()
  deleting.value = true
  error.value = ''
  try {
    await props.test.remove(record.value.id)
  } catch {
    if (!isCurrent()) return
    error.value =
      'Delete could not be confirmed. Check the Tests before trying again.'
  } finally {
    if (local()) deleting.value = false
  }
}
</script>
