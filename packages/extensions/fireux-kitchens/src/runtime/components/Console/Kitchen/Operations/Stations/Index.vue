<template>
  <section class="console-surface">
    <!-- Tools: add operation-level actions here when a real tool emerges. -->
    <ConsoleKitchenOperationsStationsRead />

    <UAlert
      v-if="readOnly"
      color="neutral"
      variant="soft"
      title="Read only"
      description="This kitchen can be inspected, but changes are disabled."
    />

    <ConsoleOperationWritePanel
      v-if="canWrite"
      title="Create station"
      description="Add an operating station for this kitchen."
    >
      <ConsoleKitchenOperationsStationsWrite />
    </ConsoleOperationWritePanel>
  </section>
</template>

<script setup lang="ts">
import { useKitchenConsoleStations } from '../../../../../composables/fireux/console/kitchen/operations/Stations/useKitchenConsoleStations'

const { readOnly, canWrite } = useKitchenConsoleStations()
</script>
