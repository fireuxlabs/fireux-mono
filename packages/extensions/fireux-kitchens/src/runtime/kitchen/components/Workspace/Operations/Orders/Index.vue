<template>
  <section class="workspace-surface">
    <WorkspaceKitchenOperationsOrdersToolbar />
    <WorkspaceKitchenOperationsOrdersServiceState />
    <WorkspaceKitchenOperationsOrdersPass />
    <WorkspaceKitchenOperationsOrdersBoardToolbar />
    <WorkspaceKitchenOperationsOrdersQueue />
  </section>
</template>

<script setup lang="ts">
import { provideKitchenOrdersWorkspace } from '../../../../composables/workspace/operations/Orders/useKitchenOrdersWorkspace'

defineOptions({ name: 'WorkspaceKitchenOperationsOrders' })

provideKitchenOrdersWorkspace()
</script>
