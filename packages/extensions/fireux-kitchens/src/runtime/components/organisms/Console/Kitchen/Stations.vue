<template>
  <section class="console-surface space-y-6">
    <ConsoleKitchenStationsRead />

    <ConsoleKitchenStationsWrite v-if="canWrite" />
  </section>
</template>

<script setup lang="ts">
import { useKitchenConsoleStations } from '../../../../composables/fireux/app/kitchen-console/useKitchenConsoleStations'

const { canWrite } = useKitchenConsoleStations()
</script>
