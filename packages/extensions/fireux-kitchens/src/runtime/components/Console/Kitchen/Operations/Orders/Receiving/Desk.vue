<template>
  <section class="receiving-desk">
    <ConsoleKitchenOperationsOrdersReceivingSelection
      class="receiving-desk__toolbar"
      :accepting="selectedOrdersAccepting"
      :can-accept="canAcceptSelectedOrders"
      :collection-count="collectionOrders.length"
      :collection-selected="allCollectionSelected"
      :scheduled-count="scheduledOrders.length"
      :scheduled-selected="allScheduledSelected"
      :selected-count="selectedOrderIds.length"
      @accept="acceptSelectedOrders"
      @clear="selectedOrderIds = []"
      @toggle-collection="toggleOrderGroup(collectionOrders)"
      @toggle-scheduled="toggleOrderGroup(scheduledOrders)"
    />

    <aside class="receiving-desk__inbox">
      <nav class="receiving-desk__list" aria-label="Orders awaiting acceptance">
        <ConsoleKitchenOperationsOrdersReceivingRow
          v-for="order in orders"
          :key="order.id"
          :order="order"
          :estimate-minutes="estimateFor(order)"
          :now-ms="nowMs"
          :accepting="acceptingOrderId === normalize(order.id)"
          :can-interact="canInteract(order)"
          :inspected="normalize(order.id) === inspectedOrderId"
          :selected="selectedOrderIds.includes(normalize(order.id))"
          @accept="$emit('accept', $event)"
          @inspect="inspectedOrderId = normalize(order.id)"
          @toggle-selection="toggleOrderSelection(order.id)"
        />
      </nav>
    </aside>

    <main class="receiving-desk__decision">
      <ConsoleKitchenOperationsOrdersReceiving
        v-if="inspectedOrder"
        :key="inspectedOrder.id"
        :accepting="acceptingOrderId === normalize(inspectedOrder.id)"
        :can-interact="canInteract(inspectedOrder)"
        :estimate-minutes="estimateFor(inspectedOrder)"
        :now-ms="nowMs"
        :order="inspectedOrder"
        :rejecting="rejectingOrderId === normalize(inspectedOrder.id)"
        @accept="$emit('accept', $event)"
        @nudge-estimate="$emit('nudge-estimate', $event)"
        @reject="$emit('reject', $event)"
        @set-estimate="$emit('set-estimate', $event)"
      />
    </main>
  </section>
</template>

<script setup lang="ts">
import {
  computed,
  ref,
  watch,
} from 'vue'
import type { KitchenOrder } from '../../../../../../models/kitchen/order.model'

defineOptions({ name: 'ConsoleKitchenOperationsOrdersReceivingDesk' })

const props = defineProps<{
  acceptingOrderId: string
  canInteract: (order: KitchenOrder) => boolean
  estimateFor: (order: KitchenOrder) => number
  nowMs: number
  orders: KitchenOrder[]
  rejectingOrderId: string
}>()

const emit = defineEmits<{
  (event: 'accept', payload: { id: string; estimatedMinutes: number | null }): void
  (event: 'accept-many', payload: Array<{ id: string; estimatedMinutes: number | null }>): void
  (event: 'nudge-estimate', payload: { id: string; amount: number }): void
  (event: 'reject', payload: { id: string; note: string }): void
  (event: 'set-estimate', payload: { id: string; minutes: number }): void
}>()

const normalize = (value: unknown) => String(value ?? '').trim()
const record = (value: unknown): Record<string, unknown> =>
  value && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {}
const inspectedOrderId = ref('')
const selectedOrderIds = ref<string[]>([])
const scheduledOrders = computed(() => props.orders.filter(isScheduled))
const collectionOrders = computed(() => props.orders.filter((order) =>
  order.order_type === 'collection' && !isScheduled(order)
))
const allCollectionSelected = computed(() => groupIsSelected(collectionOrders.value))
const allScheduledSelected = computed(() => groupIsSelected(scheduledOrders.value))
const selectedOrders = computed(() => props.orders.filter((order) =>
  selectedOrderIds.value.includes(normalize(order.id))
))
const selectedOrdersAccepting = computed(() => selectedOrders.value.some((order) =>
  props.acceptingOrderId === normalize(order.id)
))
const canAcceptSelectedOrders = computed(() =>
  Boolean(selectedOrders.value.length) && selectedOrders.value.every(props.canInteract)
)
const inspectedOrder = computed(() =>
  props.orders.find((order) => normalize(order.id) === inspectedOrderId.value) ||
    props.orders[0]
)

watch(
  () => props.orders.map((order) => normalize(order.id)),
  (ids) => {
    if (!ids.includes(inspectedOrderId.value)) inspectedOrderId.value = ids[0] || ''
    selectedOrderIds.value = selectedOrderIds.value.filter((id) => ids.includes(id))
  },
  { immediate: true }
)

function toggleOrderSelection(orderId: unknown) {
  const id = normalize(orderId)
  if (!id) return

  selectedOrderIds.value = selectedOrderIds.value.includes(id)
    ? selectedOrderIds.value.filter((selectedId) => selectedId !== id)
    : [...selectedOrderIds.value, id]
}

function toggleOrderGroup(orders: KitchenOrder[]) {
  const ids = orders.map((order) => normalize(order.id)).filter(Boolean)
  if (!ids.length) return

  const group = new Set(ids)
  selectedOrderIds.value = groupIsSelected(orders)
    ? selectedOrderIds.value.filter((id) => !group.has(id))
    : Array.from(new Set([...selectedOrderIds.value, ...ids]))
}

function groupIsSelected(orders: KitchenOrder[]) {
  return Boolean(
    orders.length &&
    orders.every((order) => selectedOrderIds.value.includes(normalize(order.id)))
  )
}

function isScheduled(order: KitchenOrder) {
  return order.order_type === 'pre_order' ||
    (
      order.order_type === 'collection' &&
      normalize(record(order.collection).mode) === 'scheduled'
    )
}

function acceptSelectedOrders() {
  if (!canAcceptSelectedOrders.value) return

  emit(
    'accept-many',
    selectedOrders.value.map((order) => ({
      id: normalize(order.id),
      estimatedMinutes: isScheduled(order) ? null : props.estimateFor(order),
    }))
  )
}

</script>

<style scoped>
.receiving-desk {
  display: grid;
  grid-template-columns: minmax(15rem, 0.75fr) minmax(22rem, 1.75fr);
  min-height: 100%;
}

.receiving-desk__inbox,
.receiving-desk__decision {
  min-width: 0;
}

.receiving-desk__toolbar {
  grid-column: 1 / -1;
  margin-bottom: calc(var(--spacing) * 3);
}

.receiving-desk__inbox {
  padding-right: calc(var(--spacing) * 4);
}

.receiving-desk__decision {
  padding-left: calc(var(--spacing) * 4);
}

.receiving-desk__list {
  display: grid;
  gap: var(--spacing);
  max-height: 60dvh;
  overflow-y: auto;
  overscroll-behavior: contain;
  padding-right: var(--spacing);
  scrollbar-gutter: stable;
}

@media (max-width: 48rem) {
  .receiving-desk {
    grid-template-columns: minmax(0, 1fr);
  }

  .receiving-desk__inbox {
    padding-bottom: calc(var(--spacing) * 3);
    padding-right: 0;
  }

  .receiving-desk__decision {
    padding-left: 0;
    padding-top: calc(var(--spacing) * 3);
  }

  .receiving-desk__list {
    display: flex;
    max-height: none;
    overflow-x: auto;
    overflow-y: visible;
    padding-right: 0;
    scrollbar-gutter: auto;
  }
}
</style>
