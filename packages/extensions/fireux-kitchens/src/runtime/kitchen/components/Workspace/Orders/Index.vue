<template>
  <section class="workspace-surface">
    <WorkspaceKitchenOrdersToolbar />
    <WorkspaceKitchenOrdersServiceState />
    <WorkspaceKitchenOrdersPass v-if="view !== 'queue'" />
    <WorkspaceKitchenOrdersBoardToolbar v-if="view !== 'pass'" />
    <WorkspaceKitchenOrdersQueue v-if="view !== 'pass'" />
  </section>
</template>

<script setup lang="ts">
import { provideKitchenOrdersContext } from '../../../composables/workspace/orders/useKitchenOrdersContext'

defineOptions({ name: 'WorkspaceKitchenOrders' })

withDefaults(defineProps<{ view?: 'all' | 'queue' | 'pass' }>(), {
  view: 'all',
})
provideKitchenOrdersContext()
</script>
