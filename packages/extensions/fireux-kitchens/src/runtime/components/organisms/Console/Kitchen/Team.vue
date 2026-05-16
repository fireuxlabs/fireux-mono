<template>
  <section class="console-surface space-y-6">
    <ConsoleKitchenTeamRead />

    <ConsoleKitchenTeamWrite v-if="canWrite" />
  </section>
</template>

<script setup lang="ts">
import { useKitchenConsoleTeam } from '../../../../composables/fireux/app/kitchen-console/useKitchenConsoleTeam'

const { canWrite } = useKitchenConsoleTeam()
</script>
