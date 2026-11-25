<template>
  <UCard>
    <template #header><h2>Apps in this database</h2></template>

    <UAlert v-if="read.status === 'loading'" title="Loading Apps" />
    <UAlert v-else-if="read.status === 'empty'" title="No Apps in this database" />
    <UAlert v-else-if="read.status === 'error'" color="error" title="Could not read Apps" />
    <ul v-else-if="read.status === 'ready'">
      <li v-for="app in read.apps" :key="app.id">
        <UAlert :title="app.name" :description="app.id" />
      </li>
    </ul>
  </UCard>
</template>

<script setup lang="ts">
import type { AppSummary } from '../app-summary'

defineProps<{
  read:
    | { status: 'loading' | 'empty' | 'error' }
    | { status: 'ready'; apps: AppSummary[] }
}>()
</script>
