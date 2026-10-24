<template>
  <header class="workspace-panel-header">
    <h2 class="fx-type-card-title">{{ title || 'Tests' }}</h2>
    <UButton
      label="Create Test"
      icon="i-lucide-plus"
      v-if="!pending && !readError"
      @click="createOpen = true"
    />
    <UModal v-model:open="createOpen" title="Create a Test">
      <template #body
        ><TestForm label="Create" :submit="create" :active="createOpen" :capture-intent="captureIntent" @saved="createOpen = false"
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
  <div v-else class="grid min-w-0 grid-cols-1 gap-2">
    <WorkspaceSelectionRow
      v-for="record in records"
      :key="record.id"
      :selected="selectedId === record.id"
      @select="$emit('select', record.id)"
    >
      <UAvatar icon="i-lucide-flask-conical" />
      <span class="truncate">{{ record.value }}</span>
    </WorkspaceSelectionRow>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import TestForm from './Form.vue'
defineProps<{
  captureIntent: () => () => boolean
  title?: string
  records: { id: string; value: string }[]
  selectedId?: string
  pending: boolean
  readError: boolean
  create: (value: string) => Promise<void>
}>()
defineEmits<{ select: [id: string] }>()
const createOpen = ref(false)
</script>
