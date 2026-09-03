<template>
  <WorkspaceKitchenAIAssistant
    v-bind="teamAI"
    operation="team"
    :kitchen-id="state.kitchen.id"
    compact
    :show-intro="false"
  />
</template>

<script setup lang="ts">
import { useKitchenTeamAI } from '../../../composables/workspace/team/useKitchenTeamAI'
import type { useKitchenWorkspaceTeam } from '../../../composables/workspace/team/useKitchenWorkspaceTeam'

type Workspace = ReturnType<typeof useKitchenWorkspaceTeam>

const props = defineProps<{
  state: Workspace['state']['value']
  derived: Workspace['derived']['value']
}>()

const teamAI = useKitchenTeamAI(() => ({
  state: props.state,
  derived: props.derived,
}))
</script>
