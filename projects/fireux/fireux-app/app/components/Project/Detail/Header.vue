<template>
  <UPageHeader :title="project.identity.name || project.id" :description="project.identity.description">
    <template #headline>FireUX Project</template>
    <template #links>
      <UButton
        to="/projects"
        label="All Projects"
        icon="i-lucide-arrow-left"
        color="neutral"
        variant="ghost"
      />
    </template>
  </UPageHeader>
</template>

<script setup lang="ts">
import type { ProjectPublicSummary } from 'fireux-fireux/runtime/project/models/project.model'
defineProps<{ project: ProjectPublicSummary }>()
</script>
