<template>
  <section class="workspace-surface">
    <WorkspaceKitchenOrdersToolbar />
    <UAlert
      v-if="transitionError"
      color="error"
      title="Order could not be updated"
      :description="transitionError"
    >
      <template #actions
        ><MoleculesCopyError :message="transitionError"
      /></template>
    </UAlert>
    <p v-if="outcome === 'pending'" role="status" class="text-sm text-muted">
      Loading orders…
    </p>
    <UAlert
      v-else-if="outcome === 'error'"
      color="error"
      title="Orders could not be loaded"
      description="Try again when the connection is available."
    >
      <template #actions>
        <MoleculesCopyError
          message="Orders could not be loaded. Try again when the connection is available."
        />
      </template>
    </UAlert>
    <template v-else-if="outcome === 'ready' || outcome === 'empty'">
      <WorkspaceKitchenOrdersOperatingState />
      <WorkspaceKitchenOrdersPass v-if="view !== 'queue'" />
      <WorkspaceKitchenOrdersBoardToolbar v-if="view !== 'pass'" />
      <WorkspaceKitchenOrdersConfirmed v-if="view !== 'pass'" />
      <WorkspaceKitchenOrdersQueue v-if="view !== 'pass'" />
    </template>
    <p v-else class="text-sm text-muted">
      Select an available Kitchen to view orders.
    </p>
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
const { transitionError, outcome, debug } = provideKitchenOrdersContext()
</script>
