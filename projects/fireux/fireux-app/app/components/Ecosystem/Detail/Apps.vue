<template>
  <section class="pagebody">
    <h2 class="fx-type-section-title">Apps</h2>
    <UPageGrid>
      <UCard v-for="app in apps" :key="app.id">
        <ULink :to="`/apps/${encodeURIComponent(app.id)}`">
          {{ app.name || app.id }}
        </ULink>
        <p class="fx-type-caption">
          {{ app.description || app.tagline }}
        </p>
      </UCard>
    </UPageGrid>
    <p v-if="pending" class="fx-type-caption">Loading Apps...</p>
    <FireCopyError v-else-if="error" :message="String(error)" />
    <p v-else-if="!apps.length" class="fx-type-caption">No published Apps.</p>
  </section>
</template>

<script setup lang="ts">
import type { Ecosystem } from 'fireux-core/runtime/ecosystem/models/ecosystem.model'
import { useEcosystemApps } from 'fireux-core/runtime/ecosystem/composables/useEcosystemApps'
const props = defineProps<{ ecosystem: Ecosystem }>()
const { apps, pending, error } = useEcosystemApps(() => props.ecosystem.id)
</script>
