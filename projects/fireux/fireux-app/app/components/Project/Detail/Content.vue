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
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Project } from 'fireux-core/runtime/project/models/project.model'
import { useApps } from 'fireux-core/runtime/app/composables/useApps'
const props = defineProps<{ project: Project }>()
const { apps: allApps } = useApps('/api/platform/apps')
const apps = computed(() =>
  allApps.value.filter((app) => app.project_id === props.project.id)
)
</script>
