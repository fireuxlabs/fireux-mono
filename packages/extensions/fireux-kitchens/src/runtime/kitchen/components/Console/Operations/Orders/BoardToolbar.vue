<template>
  <UDashboardToolbar v-if="incomingOrders.length || recentOrders.length">
    <template #left>
      <ConsoleKitchenOperationsOrdersIncoming />
      <ConsoleKitchenOperationsOrdersComplete />
    </template>
  </UDashboardToolbar>
</template>

<script setup lang="ts">
import { useKitchenOrdersWorkspace } from '../../../../composables/console/operations/Orders/useKitchenOrdersWorkspace'

defineOptions({ name: 'ConsoleKitchenOperationsOrdersBoardToolbar' })

const { incomingOrders, recentOrders } = useKitchenOrdersWorkspace()
</script>
