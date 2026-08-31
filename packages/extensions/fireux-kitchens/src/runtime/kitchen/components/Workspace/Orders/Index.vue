<template>
  <section class="workspace-surface">
    <WorkspaceKitchenOrdersKioskDoorway />
    <WorkspaceKitchenOrdersToolbar />
    <WorkspaceKitchenOrdersServiceState />
    <WorkspaceKitchenOrdersPass />
    <WorkspaceKitchenOrdersBoardToolbar />
    <WorkspaceKitchenOrdersQueue />
  </section>
</template>

<script setup lang="ts">
import { provideKitchenOrdersWorkspace } from '../../../composables/workspace/Orders/useKitchenOrdersWorkspace'

defineOptions({ name: 'WorkspaceKitchenOrders' })

provideKitchenOrdersWorkspace()
</script>
