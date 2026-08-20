<template>
  <WorkspaceKitchenAIWelcome v-bind="teamAI" />
</template>

<script setup lang="ts">
import { useKitchenTeamAI } from '../../../composables/workspace/team/useKitchenTeamAI'

const teamAI = useKitchenTeamAI()
</script>
