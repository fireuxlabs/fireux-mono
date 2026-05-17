<template>
  <section class="console-surface space-y-6">
    <ConsoleKitchenMenusRead v-if="selectedKitchen" />

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
import { useKitchenConsole } from '../../../../composables/fireux/console/kitchen/useKitchenConsole'

const { selectedKitchen } = useKitchenConsole()
</script>
