<template>
  <section class="console-surface space-y-6">
    <ConsoleKitchenOperationsDishesRead />

    <UAlert
      v-if="readOnly"
      color="neutral"
      variant="soft"
      title="Read only"
      description="This kitchen can be inspected, but changes are disabled."
    />

    <ConsoleKitchenOperationsDishesWrite v-if="canWrite" />
  </section>
</template>

<script setup lang="ts">
import { useKitchenConsoleDishes } from '../../../../../composables/fireux/console/kitchen/operations/Dishes/useKitchenConsoleDishes'

const { readOnly, canWrite } = useKitchenConsoleDishes({ resolveMenuSections: false })
</script>
