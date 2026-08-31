<template>
  <WorkspaceKitchenAIAssistant v-bind="teamAI" compact :show-intro="false" />
</template>

<script setup lang="ts">
import { useKitchenTeamAI } from '../../../composables/workspace/team/useKitchenTeamAI'

const teamAI = useKitchenTeamAI()
</script>
