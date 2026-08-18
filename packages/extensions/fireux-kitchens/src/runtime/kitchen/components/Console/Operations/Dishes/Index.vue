<template>
  <section class="console-surface">
    <div v-if="kitchenId" class="space-y-4">
      <ConsoleKitchenOperationsDishesRead />

      <ConsoleKitchenOperationsDishesTools />
    </div>

    <UAlert
      v-else
      color="neutral"
      variant="soft"
      title="Select a kitchen"
      :description="`Choose a kitchen before managing ${catalogue.plural}.`"
    />
  </section>
</template>

<script setup lang="ts">
import { useKitchenDishesWorkspace } from '../../../../composables/console/operations/Dishes/useKitchenDishesWorkspace'
import ConsoleKitchenOperationsDishesRead from './Read.vue'
import ConsoleKitchenOperationsDishesTools from './Tools.vue'

const {
  kitchenId,
  catalogue,
} = useKitchenDishesWorkspace()
</script>
