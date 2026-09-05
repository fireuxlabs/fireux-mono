<template>
  <section class="space-y-4">
    <h2 class="text-xl font-semibold">Apps</h2>
    <div class="grid gap-4 md:grid-cols-2">
      <UCard v-for="app in apps" :key="app.id">
        <ULink :to="`/apps/${encodeURIComponent(app.id)}`">
          {{ app.name || app.id }}
        </ULink>
        <p class="text-sm text-muted">
          {{ app.description || app.short_bio || app.tagline }}
        </p>
      </UCard>
    </div>
    <DevDebugPanel
      title="Project Apps relation"
      context="Platform Apps fetched by this relation and filtered for the Project."
      object-origin="fetched"
      :objects="{ allApps }"
      :derived="{ apps }"
      launcher
    />
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Project } from 'fireux-core/runtime/project/models/project.model'
import { useApps } from 'fireux-core/runtime/app/composables/useApps'
import { usePlatformDirectory } from '../../../composables/usePlatformDirectory'
const props = defineProps<{ project: Project }>()
const { apps: allApps } = useApps('/api/platform/apps')
const { data: directory } = usePlatformDirectory()
const ecosystemIds = computed(() => new Set(
  (directory.value?.ecosystems ?? [])
    .filter((ecosystem) => ecosystem.project_id === props.project.id)
    .map((ecosystem) => ecosystem.id)
))
const apps = computed(() =>
  allApps.value.filter((app) => ecosystemIds.value.has(app.ecosystem_id))
)
</script>
