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
import type { ProjectPublicSummary } from 'fireux-projects/runtime/project/models/project.model'
import { useProjectApps } from 'fireux-projects/runtime/project/composables/useProjectApps'
const props = defineProps<{ project: ProjectPublicSummary }>()
const { apps, pending, error } = useProjectApps(() => props.project.id)
</script>
