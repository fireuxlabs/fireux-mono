<template>
  <UPageGrid
    aria-label="Team tools"
    class="grid-cols-2 gap-4 md:grid-cols-4 xl:grid-cols-6"
  >
    <UPageCard
      :title="tool.label"
      :description="tool.description"
      :icon="tool.icon"
      :to="tool.to"
      class="aspect-square text-left"
      :ui="{
        container: 'p-4 sm:p-4',
        title: 'line-clamp-2',
        description: 'line-clamp-3',
      }"
      spotlight
    />
  </UPageGrid>
</template>

<script setup lang="ts">
import type { useProjectWorkspaceTeam } from '../../../composables/workspace/team/useProjectWorkspaceTeam'

type Workspace = ReturnType<typeof useProjectWorkspaceTeam>

defineProps<{
  state: Workspace['state']['value']
  derived: Workspace['derived']['value']
  actions: Workspace['actions']
}>()

const tool = {
  label: 'View Team',
  description: 'Review the people connected to this Project.',
  icon: 'i-lucide-eye',
  to: '#project-team-members',
} as const
</script>
