<template>
  <section class="console-surface space-y-6">
    <!-- Tools: add operation-level actions here when a real tool emerges. -->
    <ConsoleKitchenOperationsMiseRead />

    <UAlert
      v-if="readOnly"
      color="neutral"
      variant="soft"
      title="Read only"
      description="This kitchen can be inspected, but changes are disabled."
    />

    <ConsoleOperationWritePanel
      v-if="canWrite"
      title="Add mise task"
      description="Create prep work for this kitchen."
    >
      <ConsoleKitchenOperationsMiseWrite />
    </ConsoleOperationWritePanel>
  </section>
</template>

<script setup lang="ts">
import { useKitchenConsoleMise } from '../../../../../composables/fireux/console/kitchen/operations/Mise/useKitchenConsoleMise'

const { readOnly, canWrite } = useKitchenConsoleMise()
</script>
