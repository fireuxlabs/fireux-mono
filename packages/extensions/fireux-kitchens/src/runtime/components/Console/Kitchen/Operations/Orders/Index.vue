<template>
  <section class="console-surface">
    <ConsoleKitchenOperationsOrdersToolbar />
    <ConsoleKitchenOperationsOrdersPass />
    <ConsoleKitchenOperationsOrdersIncoming />
    <ConsoleKitchenOperationsOrdersComplete />
  </section>
</template>

<script setup lang="ts">
import { provideKitchenOrdersWorkspace } from '../../../../../composables/fireux/console/kitchen/operations/Orders/useKitchenOrdersWorkspace'

provideKitchenOrdersWorkspace()
</script>
