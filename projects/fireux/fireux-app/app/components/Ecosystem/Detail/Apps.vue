<template>
  <section class="space-y-4">
    <h2 class="text-xl font-semibold">Apps</h2>
    <div class="grid gap-4 md:grid-cols-2">
      <UCard v-for="app in apps" :key="app.id">
        <ULink :to="`/apps/${encodeURIComponent(app.id)}`">
          {{ app.name || app.id }}
        </ULink>
        <p class="text-sm text-muted">
          {{ app.description || app.tagline }}
        </p>
      </UCard>
    </div>
    <p v-if="pending" class="text-sm text-muted">Loading Apps...</p>
    <FireCopyError v-else-if="error" :message="String(error)" />
    <p v-else-if="!apps.length" class="text-sm text-muted">No published Apps.</p>
  </section>
</template>

<script setup lang="ts">
import type { Ecosystem } from 'fireux-core/runtime/ecosystem/models/ecosystem.model'
import { useEcosystemApps } from 'fireux-core/runtime/ecosystem/composables/useEcosystemApps'
const props = defineProps<{ ecosystem: Ecosystem }>()
const { apps, pending, error } = useEcosystemApps(() => props.ecosystem.id)
</script>
