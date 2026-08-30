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
import type { Ecosystem } from 'fireux-core/runtime/ecosystem/models/ecosystem.model'
import { useProjects } from 'fireux-core/runtime/project/composables/useProjects'

const props = defineProps<{ ecosystem: Ecosystem }>()
const { projects } = useProjects()
const project = computed(
  () =>
    projects.value.find((entry) => entry.id === props.ecosystem.project_id) ??
    null
)
</script>
