<template>
  <header class="flex items-center justify-between gap-2">
    <h2 class="font-semibold">In focus</h2>
    <div class="flex gap-2">
      <UButton
        label="Update"
        size="sm"
        color="neutral"
        :disabled="!record"
        @click="updateOpen = true"
      />
      <UModal v-model:open="updateOpen" title="Update Test">
        <template #body>
          <TestForm
            v-if="record"
            :key="record.id"
            label="Update"
            :initial-value="record.value"
            :submit="updateSelected"
            @saved="updateOpen = false"
          />
        </template>
      </UModal>
      <UButton
        label="Delete"
        size="sm"
        color="error"
        variant="ghost"
        :disabled="!record || deleting"
        @click="deleteSelected"
      />
    </div>
  </header>
  <p v-if="record" class="break-words text-lg">{{ record.value }}</p>
  <p v-else class="text-muted">Choose a Test.</p>
  <UAlert v-if="error" color="error" :title="error">
    <template #description><MoleculesCopyError :message="error" /></template>
  </UAlert>
  <UCard v-if="record" :key="record.id">
    <template #header><h3 class="font-medium">Update this Test</h3></template>
    <TestForm
      label="Update"
      :initial-value="record.value"
      :submit="updateSelected"
    />
    <template #footer>
      <UButton
        label="Delete this Test"
        color="error"
        variant="soft"
        :loading="deleting"
        @click="deleteSelected"
      />
    </template>
  </UCard>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import TestForm from './Form.vue'
const props = defineProps<{
  record: { id: string; value: string } | null
  update: (id: string, value: string) => Promise<void>
  remove: (id: string) => Promise<void>
}>()
const updateOpen = ref(false)
const deleting = ref(false)
const error = ref('')
const updateSelected = (value: string) =>
  props.record
    ? props.update(props.record.id, value)
    : Promise.reject(new Error('Choose a Test.'))
async function deleteSelected() {
  if (!props.record || deleting.value) return
  deleting.value = true
  error.value = ''
  try {
    await props.remove(props.record.id)
  } catch {
    error.value =
      'Delete could not be confirmed. Check the Tests before trying again.'
  } finally {
    deleting.value = false
  }
}
</script>
