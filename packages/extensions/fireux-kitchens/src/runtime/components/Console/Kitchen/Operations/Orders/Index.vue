<template>
  <section class="console-surface">
    <ConsoleKitchenOperationsOrdersToolbar />
    <ConsoleKitchenOperationsOrdersServiceState />
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
