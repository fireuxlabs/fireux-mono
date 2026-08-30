<template>
  <UPageHeader :title="project.name || project.id" :description="project.description">
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
import type { Project } from 'fireux-core/runtime/project/models/project.model'
defineProps<{ project: Project }>()
</script>
