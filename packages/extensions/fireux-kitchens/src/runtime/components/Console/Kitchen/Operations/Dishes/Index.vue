<template>
  <section class="console-surface">
    <div v-if="kitchenId" class="space-y-4">
      <ConsoleKitchenOperationsDishesRead />
    </div>

    <UAlert
      v-else
      color="neutral"
      variant="soft"
      title="Select a kitchen"
      description="Choose a kitchen before managing dishes."
    />
  </section>
</template>

<script setup lang="ts">
import { useKitchenDishesWorkspace } from '../../../../../composables/fireux/console/kitchen/operations/Dishes/useKitchenDishesWorkspace'
import ConsoleKitchenOperationsDishesRead from './Read.vue'

const {
  kitchenId,
} = useKitchenDishesWorkspace()
</script>
