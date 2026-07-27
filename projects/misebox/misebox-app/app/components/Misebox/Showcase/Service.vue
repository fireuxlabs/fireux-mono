<!-- Concurrent edit — 2026-07-22 12:41 CEST — Product Demo app pass: run adapter-projected Demo Orders through local-only board transitions. -->
<template>
  <section
    class="showcase-service"
    data-misebox-showcase="service"
    data-showcase-data-source="demo-world"
    data-showcase-order-mutations="memory-only"
  >
    <header class="showcase-service__toolbar">
      <div>
        <p>{{ kitchenName }} · today’s service</p>
        <h2>Kitchen orders</h2>
      </div>

      <div class="showcase-service__actions">
        <UBadge color="neutral" variant="soft">
          {{ completedCount }} completed
        </UBadge>
        <UButton
          color="neutral"
          variant="soft"
          icon="i-lucide-rotate-ccw"
          @click="resetOrders"
        >
          Reset service
        </UButton>
      </div>
    </header>

    <UAlert
      color="primary"
      variant="soft"
      icon="i-lucide-route"
      title="One Order lifecycle"
      description="Collection waits in Incoming. Kiosk orders are accepted automatically and begin in Queue."
    />

    <div class="showcase-service__board">
      <ConsoleKitchenOperationsOrdersRail
        accent="warning"
        :count="incomingOrders.length"
        empty-label="Nothing is waiting for acceptance."
        label="Incoming"
      >
        <ConsoleKitchenOperationsOrdersTicketPresentation
          v-for="order in incomingOrders"
          :key="order.id"
          :order="order"
          status-action-label="Accept"
          status-action-aria-label="Accept order into the Kitchen queue"
          @touch-status="acceptOrder"
        />
      </ConsoleKitchenOperationsOrdersRail>

      <ConsoleKitchenOperationsOrdersRail
        accent="primary"
        :count="queueOrders.length"
        empty-label="The preparation queue is clear."
        label="Queue"
      >
        <ConsoleKitchenOperationsOrdersTicketPresentation
          v-for="order in queueOrders"
          :key="order.id"
          :order="order"
          status-action-label="Ready"
          status-action-aria-label="Mark order ready for handoff"
          @touch-status="markReady"
        />
      </ConsoleKitchenOperationsOrdersRail>

      <ConsoleKitchenOperationsOrdersRail
        accent="success"
        :count="passOrders.length"
        empty-label="No orders are waiting at the pass."
        label="Pass"
      >
        <ConsoleKitchenOperationsOrdersTicketPresentation
          v-for="order in passOrders"
          :key="order.id"
          :order="order"
          prominent
          status-action-label="Complete"
          status-action-aria-label="Complete the order handoff"
          @touch-status="completeOrder"
        />
      </ConsoleKitchenOperationsOrdersRail>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import {
  deriveKitchenOrderBoardStage,
  type KitchenOrder,
  type KitchenOrderStatus,
} from 'fireux-kitchens/runtime/models/kitchen/order.model'

const props = defineProps<{
  initialOrders: KitchenOrder[]
  kitchenName: string
}>()
const freshOrders = (): KitchenOrder[] => props.initialOrders.map(
  (order: KitchenOrder) => ({ ...order })
)
const orders = ref<KitchenOrder[]>(freshOrders())
const incomingOrders = computed(() => stageOrders('incoming'))
const queueOrders = computed(() => stageOrders('queue'))
const passOrders = computed(() => stageOrders('pass'))
const completedCount = computed(() => orders.value.filter(
  (order: KitchenOrder) => order.status === 'completed'
).length)

function stageOrders(stage: 'incoming' | 'queue' | 'pass'): KitchenOrder[] {
  return orders.value.filter(
    (order: KitchenOrder) => deriveKitchenOrderBoardStage(order) === stage
  )
}

function updateStatus(orderId: string, status: KitchenOrderStatus) {
  orders.value = orders.value.map((order: KitchenOrder) =>
    order.id === orderId ? { ...order, status } : order
  )
}

function acceptOrder(orderId: string) {
  updateStatus(orderId, 'accepted')
}

function markReady(orderId: string) {
  updateStatus(orderId, 'ready')
}

function completeOrder(orderId: string) {
  updateStatus(orderId, 'completed')
}

function resetOrders() {
  orders.value = freshOrders()
}
</script>

<style scoped>
.showcase-service {
  display: grid;
  gap: clamp(calc(var(--spacing) * 5), 3vw, calc(var(--spacing) * 8));
  width: min(100%, 88rem);
  margin: 0 auto;
  padding: clamp(calc(var(--spacing) * 4), 3vw, calc(var(--spacing) * 8));
  border: 1px solid var(--ui-border);
  border-radius: calc(var(--ui-radius) * 4);
  background: color-mix(in srgb, var(--ui-bg) 94%, var(--ui-primary));
  box-shadow: 0 2rem 6rem rgb(15 23 42 / 10%);
}

.showcase-service__toolbar,
.showcase-service__actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: calc(var(--spacing) * 3);
}

.showcase-service__toolbar {
  justify-content: space-between;
}

.showcase-service__toolbar p,
.showcase-service__toolbar h2 {
  margin: 0;
}

.showcase-service__toolbar p {
  color: var(--ui-primary);
  font-size: 0.72rem;
  font-weight: var(--font-weight-black);
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.showcase-service__toolbar h2 {
  color: var(--ui-text-highlighted);
  font-size: clamp(var(--text-2xl), 3vw, var(--text-4xl));
  font-weight: 950;
}

.showcase-service__board {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: calc(var(--spacing) * 4);
  align-items: start;
}

@media (max-width: 62rem) {
  .showcase-service__board {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
