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

const props = defineProps<{ app: App }>()
const { projects } = useProjects()
const project = computed(
  () => projects.value.find((entry) => entry.id === props.app.project_id) ?? null
)
</script>
