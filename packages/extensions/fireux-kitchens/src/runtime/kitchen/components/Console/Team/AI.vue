<template>
  <ConsoleKitchenAIWelcome v-bind="teamAI" />
</template>

<script setup lang="ts">
import { useKitchenTeamAI } from '../../../composables/console/team/useKitchenTeamAI'

const teamAI = useKitchenTeamAI()
</script>
