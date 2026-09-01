<template>
  <WorkspaceKitchenAIAssistant v-bind="teamAI" compact :show-intro="false" />
</template>

<script setup lang="ts">
import { useKitchenTeamAI } from '../../../composables/workspace/team/useKitchenTeamAI'
import type { useKitchenWorkspaceTeam } from '../../../composables/workspace/team/useKitchenWorkspaceTeam'

type Workspace = ReturnType<typeof useKitchenWorkspaceTeam>

const props = defineProps<{
  state: Workspace['state']['value']
  derived: Workspace['derived']['value']
  actions: Workspace['actions']
}>()

const teamAI = useKitchenTeamAI(() => ({
  state: props.state,
  derived: props.derived,
}))
</script>
