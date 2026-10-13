<template>
  <section
    class="workspace-surface orders-board"
    :class="{ 'orders-board--fullscreen': fullscreen }"
  >
    <WorkspaceKitchenOrdersServiceBar
      v-if="outcome === 'ready' || outcome === 'empty'"
    />
    <div class="flex flex-wrap items-center justify-between gap-3">
      <UTabs
        v-model="view"
        :items="views"
        :content="false"
        variant="link"
        aria-label="Order board view"
      />
      <div class="flex flex-wrap items-center gap-2">
        <UPopover>
          <UButton
            label="Filters"
            icon="i-lucide-list-filter"
            color="neutral"
            :variant="
              filters.type !== 'all' || filters.timing !== 'all'
                ? 'soft'
                : 'ghost'
            "
          />
          <template #content>
            <div class="grid gap-3 p-4">
              <UFormField label="Order type"
                ><USelect v-model="filters.type" :items="types" class="w-40"
              /></UFormField>
              <UFormField label="Timing"
                ><USelect
                  v-model="filters.timing"
                  :items="timings"
                  class="w-40"
              /></UFormField>
            </div>
          </template>
        </UPopover>
        <UButton
          :label="fullscreen ? 'Exit full screen' : 'Full screen'"
          :icon="fullscreen ? 'i-lucide-minimize' : 'i-lucide-maximize'"
          color="neutral"
          variant="soft"
          :aria-pressed="fullscreen"
          :disabled="fullscreenPending"
          @click="toggleFullscreen"
        />
      </div>
    </div>
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
      <template v-if="view === 'incoming'">
        <WorkspaceKitchenOrdersIncoming
          v-if="
            incomingOrders.some((order) => order.order_type !== 'pre_order')
          "
          embedded
        />
        <WorkspaceKitchenOrdersPreOrders v-if="preOrderCount" />
        <p
          v-if="!incomingOrders.length"
          role="status"
          class="text-sm text-muted"
        >
          No new orders need acceptance.
        </p>
      </template>
      <template v-else-if="view === 'payment'">
        <WorkspaceKitchenOrdersConfirmed stage="payment" />
        <p v-if="!waitingCount" role="status" class="text-sm text-muted">
          No orders waiting for customer action.
        </p>
      </template>
      <template v-else-if="view === 'scheduled'">
        <WorkspaceKitchenOrdersConfirmed stage="scheduled" />
        <p v-if="!scheduledCount" role="status" class="text-sm text-muted">
          No scheduled orders.
        </p>
      </template>
      <template v-else-if="view === 'queue'">
        <WorkspaceKitchenOrdersConfirmed stage="preparation" />
        <WorkspaceKitchenOrdersQueue />
        <p v-if="!preparingCount" role="status" class="text-sm text-muted">
          No orders to prepare.
        </p>
      </template>
      <template v-else-if="view === 'pass'">
        <WorkspaceKitchenOrdersToolbar />
        <WorkspaceKitchenOrdersPass />
        <p v-if="!passOrders.length" role="status" class="text-sm text-muted">
          No orders ready for handoff.
        </p>
      </template>
      <WorkspaceKitchenOrdersComplete v-else-if="view === 'history'" embedded />
    </template>
    <p v-else class="text-sm text-muted">
      Select an available Kitchen to view orders.
    </p>
  </section>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { OrderBoardFilters } from '../../../utils/order-board-filter'
import { provideKitchenOrdersContext } from '../../../composables/workspace/orders/useKitchenOrdersContext'
import { useKitchenOrderBoardFullscreen } from '../../../composables/workspace/orders/useKitchenOrderBoardFullscreen'

defineOptions({ name: 'WorkspaceKitchenOrders' })

const view = ref('queue')
const { fullscreen, fullscreenPending, toggleFullscreen } =
  useKitchenOrderBoardFullscreen()
const filters = ref<OrderBoardFilters>({ type: 'all', timing: 'all' })
const countLabel = (label: string, count: number) =>
  ['ready', 'empty'].includes(outcome.value) ? `${label} · ${count}` : label
const views = computed(() => [
  { label: countLabel('New', incomingOrders.value.length), value: 'incoming' },
  {
    label: countLabel('Waiting', waitingCount.value),
    value: 'payment',
  },
  { label: countLabel('Scheduled', scheduledCount.value), value: 'scheduled' },
  { label: countLabel('Preparing', preparingCount.value), value: 'queue' },
  { label: countLabel('Ready', passOrders.value.length), value: 'pass' },
  { label: countLabel('History', historyCount.value), value: 'history' },
])
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
const {
  transitionError,
  outcome,
  kitchenId,
  incomingOrders,
  scheduledOrders,
  paymentOrders,
  queueOrders,
  passOrders,
  visibleOrderCount,
  recentOrders,
} = provideKitchenOrdersContext(filters)
const preOrderCount = computed(
  () =>
    incomingOrders.value.filter((order) => order.order_type === 'pre_order')
      .length
)
const waitingCount = computed(
  () =>
    paymentOrders.value.length +
    recentOrders.value.filter((order) => order.status === 'changes_requested')
      .length
)
const historyCount = computed(
  () =>
    recentOrders.value.filter((order) => order.status !== 'changes_requested')
      .length
)
const scheduledCount = computed(
  () =>
    scheduledOrders.value.filter((order) => order.status === 'scheduled').length
)
const preparingCount = computed(
  () =>
    queueOrders.value.length +
    scheduledOrders.value.filter(
      (order) => order.status === 'awaiting_preparation'
    ).length
)

watch(
  kitchenId,
  () => {
    view.value = 'queue'
    filters.value = { type: 'all', timing: 'all' }
  },
  { flush: 'sync' }
)
</script>

<style scoped>
.orders-board--fullscreen {
  position: fixed;
  inset: 0;
  z-index: 40;
  overflow-y: auto;
  padding: calc(var(--spacing) * 4);
  background: var(--ui-bg);
}
</style>
