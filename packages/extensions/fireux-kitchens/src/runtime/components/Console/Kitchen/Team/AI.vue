<template>
  <ConsoleKitchenAI v-bind="teamAI" />
</template>

<script setup lang="ts">
import { useKitchenTeamAI } from '../../../../composables/fireux/console/kitchen/team/useKitchenTeamAI'

const teamAI = useKitchenTeamAI()
</script>
