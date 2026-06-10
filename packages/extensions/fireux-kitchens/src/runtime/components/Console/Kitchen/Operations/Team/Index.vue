<template>
  <section class="console-surface space-y-6">
    <ConsoleKitchenOperationsTeamRead />

    <ConsoleKitchenOperationsTeamWrite v-if="canWrite" />
  </section>
</template>

<script setup lang="ts">
import { useKitchenConsoleTeam } from '../../../../../composables/fireux/console/kitchen/operations/useKitchenConsoleTeam'

const { canWrite } = useKitchenConsoleTeam()
</script>
