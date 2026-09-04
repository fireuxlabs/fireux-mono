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

const props = defineProps<{ team: Workspace }>()
const { state, derived } = props.team

const teamAI = useKitchenTeamAI(() => ({
  state: state.value,
  derived: derived.value,
}))
</script>
