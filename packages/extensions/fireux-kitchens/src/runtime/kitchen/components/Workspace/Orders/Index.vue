<template>
  <section class="workspace-surface">
    <div class="flex flex-wrap items-end justify-between gap-4">
      <UTabs
        v-model="view"
        :items="views"
        :content="false"
        variant="link"
        aria-label="Order board view"
      />
      <div class="flex flex-wrap gap-3">
        <UFormField label="Order type"
          ><USelect v-model="filters.type" :items="types" class="w-40"
        /></UFormField>
        <UFormField label="Timing"
          ><USelect v-model="filters.timing" :items="timings" class="w-40"
        /></UFormField>
      </div>
    </div>
    <WorkspaceKitchenOrdersToolbar v-if="view !== 'queue'" />
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
      <UAlert
        v-if="
          visibleOrderCount === 0 &&
          (filters.type !== 'all' || filters.timing !== 'all')
        "
        title="No orders match these filters"
        color="neutral"
        variant="subtle"
      >
        <template #actions
          ><UButton
            label="Clear filters"
            color="neutral"
            variant="soft"
            @click="filters = { type: 'all', timing: 'all' }"
        /></template>
      </UAlert>
      <WorkspaceKitchenOrdersPreOrders
        v-if="
          view !== 'pass' &&
          (filters.type === 'pre_order' ||
            incomingOrders.some((order) => order.order_type === 'pre_order'))
        "
      />
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
import { ref, watch } from 'vue'
import type { OrderBoardFilters } from '../../../utils/order-board-filter'
import { provideKitchenOrdersContext } from '../../../composables/workspace/orders/useKitchenOrdersContext'

defineOptions({ name: 'WorkspaceKitchenOrders' })

const view = ref('all')
const filters = ref<OrderBoardFilters>({ type: 'all', timing: 'all' })
const views = [
  { label: 'All orders', value: 'all' },
  { label: 'Kitchen queue', value: 'queue' },
  { label: 'Pass & handoff', value: 'pass' },
]
const types = [
  { label: 'All types', value: 'all' },
  { label: 'Collection', value: 'collection' },
  { label: 'Delivery', value: 'delivery' },
  { label: 'Dine-in', value: 'dine_in' },
  { label: 'Eat-in', value: 'eat_in' },
  { label: 'Takeaway', value: 'takeaway' },
  { label: 'Room service', value: 'room_service' },
  { label: 'Pre-orders', value: 'pre_order' },
]
const timings = [
  { label: 'All times', value: 'all' },
  { label: 'Scheduled', value: 'scheduled' },
  { label: 'Immediate', value: 'immediate' },
]
const isDev = import.meta.dev
const {
  transitionError,
  outcome,
  debug,
  kitchenId,
  incomingOrders,
  visibleOrderCount,
} = provideKitchenOrdersContext(filters)
watch(
  kitchenId,
  () => {
    view.value = 'all'
    filters.value = { type: 'all', timing: 'all' }
  },
  { flush: 'sync' }
)
</script>
