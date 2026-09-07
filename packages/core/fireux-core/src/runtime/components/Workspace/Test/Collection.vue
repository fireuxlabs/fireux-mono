<template>
  <header class="flex items-center justify-between gap-2">
    <h2 class="font-semibold">Tests</h2>
    <UButton
      label="Create"
      icon="i-lucide-plus"
      size="sm"
      :disabled="pending || readError"
      @click="createOpen = true"
    />
    <UModal v-model:open="createOpen" title="Create a Test">
      <template #body
        ><TestForm label="Create" :submit="create" @saved="createOpen = false"
      /></template>
    </UModal>
  </header>
  <p v-if="pending" role="status" class="text-muted">Loading…</p>
  <UAlert v-else-if="readError" color="error" title="Tests could not be loaded">
    <template #description
      ><MoleculesCopyError message="Tests could not be loaded"
    /></template>
  </UAlert>
  <p v-else-if="!records.length" class="text-muted">No Tests yet.</p>
  <div v-else class="grid gap-1">
    <UButton
      v-for="record in records"
      :key="record.id"
      :label="record.value"
      color="neutral"
      :variant="selectedId === record.id ? 'soft' : 'ghost'"
      class="justify-start text-left whitespace-normal break-words"
      :aria-pressed="selectedId === record.id"
      @click="$emit('select', record.id)"
    />
  </div>
  <UCard v-if="!pending && !readError">
    <template #header><h3 class="font-medium">Create a Test</h3></template>
    <TestForm label="Create" :submit="create" />
  </UCard>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import TestForm from './Form.vue'
defineProps<{
  records: { id: string; value: string }[]
  selectedId?: string
  pending: boolean
  readError: boolean
  create: (value: string) => Promise<void>
}>()
defineEmits<{ select: [id: string] }>()
const createOpen = ref(false)
</script>
