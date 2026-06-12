<template>
  <section class="console-surface space-y-6">
    <ConsoleKitchenOperationsStationsRead />

    <UAlert
      v-if="readOnly"
      color="neutral"
      variant="soft"
      title="Read only"
      description="This kitchen can be inspected, but changes are disabled."
    />

    <ConsoleKitchenOperationsStationsWrite v-if="canWrite" />
  </section>
</template>

<script setup lang="ts">
import { useKitchenConsoleStations } from '../../../../../composables/fireux/console/kitchen/operations/Stations/useKitchenConsoleStations'

const { readOnly, canWrite } = useKitchenConsoleStations()
</script>
