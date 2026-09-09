<template>
  <UDashboardToolbar v-if="incomingOrders.length || recentOrders.length">
    <template #left>
      <WorkspaceKitchenOrdersIncoming />
      <WorkspaceKitchenOrdersComplete />
    </template>
  </UDashboardToolbar>
</template>

<script setup lang="ts">
import { useKitchenOrdersContext } from '../../../composables/workspace/orders/useKitchenOrdersContext'

defineOptions({ name: 'WorkspaceKitchenOrdersBoardToolbar' })

const { incomingOrders, recentOrders } = useKitchenOrdersContext()
</script>
