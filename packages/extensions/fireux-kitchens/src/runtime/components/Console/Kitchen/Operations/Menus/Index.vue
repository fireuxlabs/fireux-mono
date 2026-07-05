<template>
  <section class="console-surface space-y-6">
    <template v-if="selectedKitchen">
      <!-- Tools: add operation-level actions here when a real tool emerges. -->
      <ConsoleKitchenOperationsMenusRead />
      <ConsoleKitchenOperationsMenusQR />

      <UAlert
        v-if="readOnly"
        color="neutral"
        variant="soft"
        title="Read only"
        description="This kitchen can be inspected, but changes are disabled."
      />

      <ConsoleOperationWritePanel
        v-if="canWrite"
        title="Menu creation tools"
        description="Upload sources, process drafts, and create kitchen menus."
      >
        <div class="space-y-6">
          <ConsoleKitchenOperationsMenusCreation />
          <ConsoleKitchenOperationsMenusCreationQueue />
        </div>
      </ConsoleOperationWritePanel>

      <ConsoleKitchenOperationsMenusDebug />
    </template>

    <UAlert
      v-else
      color="neutral"
      variant="soft"
      title="Select a kitchen"
      description="Choose a kitchen before managing menus."
    />
  </section>
</template>

<script setup lang="ts">
import { useKitchenConsoleMenus } from '../../../../../composables/fireux/console/kitchen/operations/Menus/useKitchenConsoleMenus'

const {
  selectedKitchen,
  readOnly,
  canWrite,
} = useKitchenConsoleMenus()
</script>
