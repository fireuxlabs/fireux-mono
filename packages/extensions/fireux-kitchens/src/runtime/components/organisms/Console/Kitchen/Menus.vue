<template>
  <section class="console-surface space-y-6">
    <OrganismsConsoleKitchenMenusRead v-if="selectedKitchen" />

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
import { useKitchenConsole } from '../../../../composables/fireux/app/kitchen-console/useKitchenConsole'

const { selectedKitchen } = useKitchenConsole()
</script>
