<template>
  <UDashboardToolbar v-if="incomingOrders.length || recentOrders.length">
    <template #left>
      <WorkspaceKitchenOrdersIncoming />
      <WorkspaceKitchenOrdersComplete />
    </template>
  </UDashboardToolbar>
</template>

<script setup lang="ts">
import { useKitchenOrdersWorkspace } from '../../../composables/workspace/Orders/useKitchenOrdersWorkspace'

defineOptions({ name: 'WorkspaceKitchenOrdersBoardToolbar' })

const { incomingOrders, recentOrders } = useKitchenOrdersWorkspace()
</script>
