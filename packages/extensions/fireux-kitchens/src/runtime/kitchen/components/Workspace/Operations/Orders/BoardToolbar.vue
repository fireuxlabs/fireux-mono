<template>
  <UDashboardToolbar v-if="incomingOrders.length || recentOrders.length">
    <template #left>
      <WorkspaceKitchenOperationsOrdersIncoming />
      <WorkspaceKitchenOperationsOrdersComplete />
    </template>
  </UDashboardToolbar>
</template>

<script setup lang="ts">
import { useKitchenOrdersWorkspace } from '../../../../composables/workspace/operations/Orders/useKitchenOrdersWorkspace'

defineOptions({ name: 'WorkspaceKitchenOperationsOrdersBoardToolbar' })

const { incomingOrders, recentOrders } = useKitchenOrdersWorkspace()
</script>
