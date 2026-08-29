<template>
  <section aria-label="Project">
    <div
      v-if="!project.name && !project.tagline && !project.url"
      class="flex items-center gap-4"
    >
      <USkeleton class="size-12 rounded-full" />
      <div class="grid gap-2">
        <USkeleton class="h-4 w-[250px]" />
        <USkeleton class="h-4 w-[200px]" />
      </div>
    </div>

    <UUser
      v-else
      :name="project.name"
      :description="project.tagline"
      :avatar="{
        src: project.url || undefined,
        alt: project.name,
        icon: 'i-lucide-briefcase-business',
      }"
      size="lg"
    />
  </section>
</template>

<script setup lang="ts">
import type { ProjectWorkspaceIndexState } from '../../composables/workspace/index/useProjectWorkspaceIndex'

defineProps<{
  project: ProjectWorkspaceIndexState['project']
}>()
</script>
