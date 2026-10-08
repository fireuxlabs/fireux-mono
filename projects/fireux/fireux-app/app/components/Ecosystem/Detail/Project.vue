<template>
  <UCard v-if="project">
    <template #header>Project</template>
    <ULink :to="`/projects/${encodeURIComponent(project.id)}`">
      {{ project.identity.name || project.id }}
    </ULink>
    <p class="text-sm text-muted">{{ project.identity.description }}</p>
  </UCard>
  <DevDebugPanel
    title="Ecosystem Project relation"
    context="Projects fetched by this relation and the Project selected for the Ecosystem."
    object-origin="fetched"
    :objects="{ projects }"
    :derived="{ projectId: ecosystem.project_id, project }"
    launcher
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Ecosystem } from 'fireux-core/runtime/ecosystem/models/ecosystem.model'
import { useProjects } from 'fireux-fireux/runtime/project/composables/useProjects'

const props = defineProps<{ ecosystem: Ecosystem }>()
const { projects } = useProjects()
const project = computed(
  () =>
    projects.value.find((entry) => entry.id === props.ecosystem.project_id) ??
    null
)
</script>
