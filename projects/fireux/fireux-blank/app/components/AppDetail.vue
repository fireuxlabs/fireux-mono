<template>
  <UCard>
    <template #header><h2>My App</h2></template>

    <UAlert v-if="read.status === 'loading'" title="Loading App" />
    <UAlert v-else-if="read.status === 'missing'" title="App not found" />
    <UAlert v-else-if="read.status === 'error'" color="error" title="Could not read App" />
    <UAlert v-else-if="read.status === 'ready'" :title="read.app.name" :description="read.app.id" />
  </UCard>
</template>

<script setup lang="ts">
import type { AppSummary } from '../app-summary'

defineProps<{
  read:
    | { status: 'loading' | 'missing' | 'error' }
    | { status: 'ready'; app: AppSummary }
}>()
</script>
