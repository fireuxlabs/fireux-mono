<template>
  <UPageGrid
    aria-label="Team tools"
    class="grid-cols-2 gap-4 md:grid-cols-4 xl:grid-cols-6"
  >
    <UPageCard
      :as="derived.capability.primitives.create.available ? 'button' : 'div'"
      :title="createTool.label"
      :description="createTool.description"
      :icon="createTool.icon"
      class="aspect-square text-left"
      :class="{
        'opacity-50': !derived.capability.primitives.create.available,
      }"
      :ui="{
        container: 'p-4 sm:p-4',
        title: 'line-clamp-2',
        description: 'line-clamp-3',
      }"
      :spotlight="derived.capability.primitives.create.available"
      @click="
        derived.capability.primitives.create.available && natives.openCreate()
      "
    />
  </UPageGrid>
</template>

<script setup lang="ts">
import { useKitchenTeamTools } from '../../../composables/workspace/team/useKitchenTeamTools'
import type { useKitchenWorkspaceTeam } from '../../../composables/workspace/team/useKitchenWorkspaceTeam'

type Workspace = ReturnType<typeof useKitchenWorkspaceTeam>

const props = defineProps<{ team: Workspace }>()
const { derived, natives } = props.team

const tools = useKitchenTeamTools()
const createTool = tools.find(
  (candidate) => candidate.id === 'kitchen.team.create-member'
)!
</script>
