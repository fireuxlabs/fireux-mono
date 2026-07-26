<template>
  <section class="console-surface">
    <div v-if="kitchenId" class="space-y-4">
      <div class="grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(20rem,0.48fr)]">
        <ConsoleKitchenOperationsMenusList />

        <ConsoleKitchenOperationsMenusTools />
      </div>

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
import { provideKitchenMenusWorkspace } from '../../../../../composables/fireux/console/kitchen/operations/Menus/useKitchenMenusWorkspace'

const {
  kitchenId,
} = provideKitchenMenusWorkspace()
</script>
