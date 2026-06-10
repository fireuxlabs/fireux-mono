<template>
  <section class="console-surface space-y-6">
    <ConsoleKitchenStationsRead />

    <ConsoleKitchenStationsWrite v-if="canWrite" />
  </section>
</template>

<script setup lang="ts">
import { useKitchenConsoleStations } from '../../../../composables/fireux/console/kitchen/operations/useKitchenConsoleStations'

const { canWrite } = useKitchenConsoleStations()
</script>
