<template>
  <UCard>
    <template #header><h2>Apps in this database</h2></template>

    <UAlert v-if="read.status === 'loading'" title="Loading Apps" />
    <UAlert v-else-if="read.status === 'empty'" title="No Apps in this database" />
    <UAlert v-else-if="read.status === 'error'" color="error" title="Could not read Apps" />
    <UPageGrid v-else-if="read.status === 'ready'" as="ul">
      <li v-for="app in read.apps" :key="app.id">
        <UPageCard :as="{ title: 'h3' }" :title="app.name">
          <template #description>
            <p v-if="app.tagline">{{ app.tagline }}</p>
            <p>{{ app.id }}</p>
          </template>
          <template v-if="app.role || app.status" #footer>
            <UBadge v-if="app.role" color="neutral">{{ app.role }}</UBadge>
            <UBadge v-if="app.status" :color="app.status === 'active' ? 'success' : 'neutral'">
              {{ app.status }}
            </UBadge>
          </template>
        </UPageCard>
      </li>
    </UPageGrid>
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
