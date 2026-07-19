<template>
  <section class="console-surface">
    <!-- Tools: add operation-level actions here when a real tool emerges. -->
    <ConsoleKitchenOperationsDishesRead />

    <UAlert
      v-if="readOnly"
      color="neutral"
      variant="soft"
      title="Read only"
      description="This kitchen can be inspected, but changes are disabled."
    />

    <ConsoleOperationWritePanel
      v-if="canWrite"
      title="Create dish"
      description="Add a dish to this kitchen library."
    >
      <ConsoleKitchenOperationsDishesWrite />
    </ConsoleOperationWritePanel>
  </section>
</template>

<script setup lang="ts">
import { useKitchenConsoleDishes } from '../../../../../composables/fireux/console/kitchen/operations/Dishes/useKitchenConsoleDishes'

const { readOnly, canWrite } = useKitchenConsoleDishes({ resolveMenuSections: false })
</script>
