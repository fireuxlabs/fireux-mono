<template>
  <section class="console-surface">
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
      title="Prep status board"
      description="Move current prep tasks through their working states."
    >
      <ConsoleKitchenOperationsMiseWrite />
    </ConsoleOperationWritePanel>
  </section>
</template>

<script setup lang="ts">
import { provideKitchenMiseWorkspace } from '../../../../composables/console/operations/Mise/useKitchenMiseWorkspace'

const { readOnly, canWrite } = provideKitchenMiseWorkspace()
</script>
