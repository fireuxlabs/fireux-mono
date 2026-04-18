<template>
  <LayoutsDashboardNavbar :title="title" :ui="ui">
    <template #right>
      <div
        v-if="project"
        class="flex items-center gap-2 text-sm text-toned"
      >
        <span class="hidden sm:inline">Selected project</span>
        <UBadge color="neutral" variant="soft">
          {{ project.title }}
        </UBadge>
        <UButton
          color="neutral"
          variant="ghost"
          size="xs"
          icon="i-lucide-x"
          @click="clearSelectedProject()"
        >
          Clear
        </UButton>
      </div>

      <slot name="right" />
    </template>
  </LayoutsDashboardNavbar>
</template>

<script setup lang="ts">
import { useProjectConsole } from '../../../composables/fireux/app/project-console/useProjectConsole'

defineProps<{
  title: string
  ui?: any
}>()

const { project, clearSelectedProject } = useProjectConsole()
</script>
