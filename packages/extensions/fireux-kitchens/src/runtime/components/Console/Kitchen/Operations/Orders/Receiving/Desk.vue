<template>
  <section class="receiving-desk">
    <aside class="receiving-desk__inbox">
      <ConsoleKitchenOperationsOrdersReceivingOverview
        :collection-count="surfaceCounts.collection"
        :delivery-count="surfaceCounts.delivery"
        :pre-order-count="surfaceCounts.pre_order"
      />

      <nav class="receiving-desk__list" aria-label="Orders awaiting acceptance">
        <ConsoleKitchenOperationsOrdersReceivingRow
          v-for="order in orders"
          :key="order.id"
          :order="order"
          :selected="normalize(order.id) === selectedOrderId"
          @select="selectedOrderId = normalize(order.id)"
        />
      </nav>
    </aside>

    <main class="receiving-desk__decision">
      <ConsoleKitchenOperationsOrdersReceiving
        v-if="selectedOrder"
        :key="selectedOrder.id"
        :accepting="acceptingOrderId === normalize(selectedOrder.id)"
        :can-interact="canInteract(selectedOrder)"
        :estimate-minutes="estimateFor(selectedOrder)"
        :now-ms="nowMs"
        :order="selectedOrder"
        :rejecting="rejectingOrderId === normalize(selectedOrder.id)"
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

defineEmits<{
  (event: 'accept', payload: { id: string; estimatedMinutes: number | null }): void
  (event: 'nudge-estimate', payload: { id: string; amount: number }): void
  (event: 'reject', payload: { id: string; note: string }): void
  (event: 'set-estimate', payload: { id: string; minutes: number }): void
}>()

const normalize = (value: unknown) => String(value ?? '').trim()
const selectedOrderId = ref('')
const selectedOrder = computed(() =>
  props.orders.find((order) => normalize(order.id) === selectedOrderId.value) ||
    props.orders[0]
)
const surfaceCounts = computed(() => {
  const counts = { collection: 0, delivery: 0, pre_order: 0 }
  for (const order of props.orders) {
    const type = normalize(order.order_type) as keyof typeof counts
    if (type in counts) counts[type] += 1
  }
  return counts
})

watch(
  () => props.orders.map((order) => normalize(order.id)),
  (ids) => {
    if (!ids.includes(selectedOrderId.value)) selectedOrderId.value = ids[0] || ''
  },
  { immediate: true }
)
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

.receiving-desk__inbox {
  border-right: 1px solid var(--ui-border);
  padding-right: calc(var(--spacing) * 4);
}

.receiving-desk__decision {
  padding-left: calc(var(--spacing) * 4);
}

.receiving-desk__list {
  display: grid;
  gap: var(--spacing);
  margin-top: calc(var(--spacing) * 4);
}

@media (max-width: 48rem) {
  .receiving-desk {
    grid-template-columns: minmax(0, 1fr);
  }

  .receiving-desk__inbox {
    border-bottom: 1px solid var(--ui-border);
    border-right: 0;
    padding-bottom: calc(var(--spacing) * 3);
    padding-right: 0;
  }

  .receiving-desk__decision {
    padding-left: 0;
    padding-top: calc(var(--spacing) * 3);
  }

  .receiving-desk__list {
    display: flex;
    overflow-x: auto;
  }
}
</style>
