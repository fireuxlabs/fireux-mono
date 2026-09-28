<template>
  <section class="workspace-surface">
    <WorkspaceKitchenOrdersToolbar />
    <UAlert
      v-if="transitionError"
      color="error"
      title="Order could not be updated"
      :description="transitionError"
    >
      <template #actions><MoleculesCopyError :message="transitionError" /></template>
    </UAlert>
    <WorkspaceKitchenOrdersServiceState />
    <WorkspaceKitchenOrdersPass v-if="view !== 'queue'" />
    <WorkspaceKitchenOrdersBoardToolbar v-if="view !== 'pass'" />
    <WorkspaceKitchenOrdersConfirmed v-if="view !== 'pass'" />
    <WorkspaceKitchenOrdersQueue v-if="view !== 'pass'" />
    <DevDebugPanel
      v-if="isDev"
      object-origin="fetched"
      launcher
      include-route
      title="Kitchen orders"
      context="Existing order reader results and derived board state"
      :objects="debug.objects"
      :derived="debug.derived"
      :hide-when-empty="false"
    />
  </section>
</template>

<script setup lang="ts">
import { provideKitchenOrdersContext } from '../../../composables/workspace/orders/useKitchenOrdersContext'

defineOptions({ name: 'WorkspaceKitchenOrders' })

withDefaults(defineProps<{ view?: 'all' | 'queue' | 'pass' }>(), {
  view: 'all',
})
const isDev = import.meta.dev
const { transitionError, debug } = provideKitchenOrdersContext()
</script>
