<template>
  <section class="console-surface">
    <div v-if="kitchenId" class="space-y-4">
      <ConsoleKitchenOperationsMenusList />

      <ConsoleKitchenOperationsMenusTools />

      <ConsoleKitchenOperationsMenusDebug />
    </div>

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
import { useKitchenMenusWorkspace } from '../../../../../composables/fireux/console/kitchen/operations/Menus/useKitchenMenusWorkspace'

const {
  kitchenId,
} = useKitchenMenusWorkspace()
</script>
