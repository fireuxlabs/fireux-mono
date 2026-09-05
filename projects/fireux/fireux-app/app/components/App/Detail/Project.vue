<template>
  <UCard v-if="project">
    <template #header>Project</template>
    <ULink :to="`/projects/${encodeURIComponent(project.id)}`">
      {{ project.name || project.id }}
    </ULink>
    <p class="text-sm text-muted">{{ project.description }}</p>
  </UCard>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { App } from 'fireux-core/runtime/app/models/app.model'
import { useProjects } from 'fireux-core/runtime/project/composables/useProjects'
import { usePlatformDirectory } from '../../../composables/usePlatformDirectory'

const props = defineProps<{ app: App }>()
const { projects } = useProjects()
const { data: directory } = usePlatformDirectory()
const ecosystem = computed(() =>
  (directory.value?.ecosystems ?? []).find(
    (entry) => entry.id === props.app.ecosystem_id
  ) ?? null
)
const project = computed(
  () => projects.value.find((entry) => entry.id === ecosystem.value?.project_id) ?? null
)
</script>
