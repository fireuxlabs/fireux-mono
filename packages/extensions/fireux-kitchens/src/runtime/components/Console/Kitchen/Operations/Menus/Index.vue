<template>
  <section class="console-surface space-y-6">
    <template v-if="selectedKitchen">
      <UAlert
        v-if="readOnly"
        color="neutral"
        variant="soft"
        title="Read only"
        description="This kitchen can be inspected, but changes are disabled."
      />

      <ConsoleKitchenOperationsMenusCreation />
      <ConsoleKitchenOperationsMenusCreationQueue />
      <ConsoleKitchenOperationsMenusRead />
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
} = useKitchenConsoleMenus()
</script>
