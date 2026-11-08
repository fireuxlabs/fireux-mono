<template>
  <UCard>
    <template #header>Project</template>
    <ULink :to="`/projects/${encodeURIComponent(project.id)}`">
      {{ project.identity.name || project.id }}
    </ULink>
    <p class="fx-type-caption">{{ project.identity.description }}</p>
  </UCard>
</template>

<script setup lang="ts">
import type { ProjectPublicSummary } from '../../models/project.model'

defineProps<{ project: ProjectPublicSummary }>()
</script>
