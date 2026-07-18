<template>
  <section class="console-surface">
    <ConsoleKitchenOperationsOrdersToolbar />
    <ConsoleKitchenOperationsOrdersPass />
    <ConsoleKitchenOperationsOrdersBoardToolbar />
    <ConsoleKitchenOperationsOrdersQueue />
  </section>
</template>

<script setup lang="ts">
import { provideKitchenOrdersWorkspace } from '../../../../../composables/fireux/console/kitchen/operations/Orders/useKitchenOrdersWorkspace'

defineOptions({ name: 'ConsoleKitchenOperationsOrders' })

provideKitchenOrdersWorkspace()
</script>
