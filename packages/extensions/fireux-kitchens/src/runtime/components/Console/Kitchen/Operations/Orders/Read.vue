<template>
  <div class="orders-board" data-kitchen-orders-board>
    <ConsoleKitchenOperationsOrdersToolbar
      :pass-count="passOrders.length"
      :selected-count="selectedPassOrders.length"
      :can-send="canSendSelectedPassOrders"
      :sending="sendingPassOrders"
      @send="sendSelectedPassOrders"
    />

    <UAlert
      v-if="transitionError"
      color="error"
      variant="soft"
      icon="i-lucide-circle-alert"
      title="Order action failed"
      :description="transitionError"
    />

    <UCard
      v-if="pending"
      variant="subtle"
      role="status"
    >
      <div class="orders-board__loading">Loading orders…</div>
    </UCard>

    <div v-else class="orders-board__content">
      <ConsoleKitchenOperationsOrdersPass
        :orders="passOrders"
        :can-interact="canInteractWith"
        :is-selected="isPassOrderSelected"
        @return="returnPassOrder"
        @toggle="togglePassOrderSelection"
      />

      <div class="orders-board__lanes">
        <ConsoleKitchenOperationsOrdersRail
          label="Incoming"
          :count="incomingOrders.length"
          empty-label="No orders waiting"
          accent="primary"
        >
          <ConsoleKitchenOperationsOrdersReceiving
            v-for="ticket in incomingOrders"
            :key="ticket.id"
            :accepting="acceptingOrderId === normalizeId(ticket.id)"
            :estimate-minutes="estimateMinutes(ticket)"
            :can-interact="canInteractWith(ticket)"
            :order="ticket"
            :rejecting="rejectingOrderId === normalizeId(ticket.id)"
            @accept="acceptIncomingOrder"
            @nudge-estimate="nudgeEstimateMinutes($event.id, $event.amount)"
            @reject="rejectIncomingOrder"
            @set-estimate="setEstimateMinutes($event.id, $event.minutes)"
          />
        </ConsoleKitchenOperationsOrdersRail>

        <ConsoleKitchenOperationsOrdersRail
          label="Queue"
          :count="queueOrders.length"
          empty-label="No orders in preparation"
        >
          <ConsoleKitchenOperationsOrdersTicket
            v-for="ticket in queueOrders"
            :key="ticket.id"
            :order="ticket"
            stage="queue"
            :interactive="canInteractWith(ticket)"
            :status-action-pending="isOrderTransitioning(ticket.id)"
            @ready="markOrderReady"
          />
        </ConsoleKitchenOperationsOrdersRail>

        <ConsoleKitchenOperationsOrdersRail
          label="Recent"
          :count="recentOrders.length"
          empty-label="No completed orders yet"
        >
          <ConsoleKitchenOperationsOrdersCardsTicket
            v-for="ticket in recentOrders"
            :key="ticket.id"
            :order="ticket"
          />
        </ConsoleKitchenOperationsOrdersRail>
      </div>

      <ConsoleKitchenOperationsOrdersRail
        v-if="unmappedOrders.length"
        label="Needs mapping"
        :count="unmappedOrders.length"
        empty-label="No unmapped orders"
        accent="warning"
      >
        <div class="orders-board__unmapped">
          <ConsoleKitchenOperationsOrdersCardsTicket
            v-for="ticket in unmappedOrders"
            :key="ticket.id"
            :order="ticket"
          />
        </div>
      </ConsoleKitchenOperationsOrdersRail>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useKitchenConsoleOrders } from '../../../../../composables/fireux/console/kitchen/operations/Orders/useKitchenConsoleOrders'
import { useKitchenOrderPassSelection } from '../../../../../composables/fireux/console/kitchen/operations/Orders/useKitchenOrderPassSelection'
import type { KitchenOrder } from '../../../../../models/kitchen/order.model'

const acceptingOrderId = ref('')
const rejectingOrderId = ref('')
const defaultEstimateMinutes = 45
const estimatesByOrderId = ref<Record<string, number>>({})
const {
  incomingOrders,
  queueOrders,
  passOrders,
  recentOrders,
  unmappedOrders,
  pending,
  readOnly,
  canWrite,
  transitionError,
  isOrderTransitioning: isOrderTransitioningFromConsole,
  acceptOrder,
  rejectOrder,
  returnOrderToQueue,
  markOrderReady: markOrderReadyFromConsole,
  completeOrder,
} = useKitchenConsoleOrders()

const normalizeId = (value: unknown) => String(value ?? '').trim()
const canOperate = computed(() => canWrite.value && !readOnly.value)
const {
  canSend: canSendSelectedPassOrders,
  isSelected: isPassOrderSelected,
  selectedOrders: selectedPassOrders,
  send: sendSelectedPassOrders,
  sending: sendingPassOrders,
  toggle: togglePassOrderSelection,
} = useKitchenOrderPassSelection({
  canOperate,
  orders: passOrders,
  isTransitioning: isOrderTransitioning,
  completeOrder,
})

async function acceptIncomingOrder(
  payload: { id: string; estimatedMinutes: number | null }
) {
  const resolvedOrderId = normalizeId(payload.id)
  if (!canOperate.value || !resolvedOrderId || acceptingOrderId.value) return

  acceptingOrderId.value = resolvedOrderId
  try {
    await runOrderAction(() =>
      acceptOrder(resolvedOrderId, payload.estimatedMinutes)
    )
  } finally {
    if (acceptingOrderId.value === resolvedOrderId) acceptingOrderId.value = ''
  }
}

async function rejectIncomingOrder(payload: { id: string; note: string }) {
  const resolvedOrderId = normalizeId(payload.id)
  const note = payload.note.trim()
  if (!canOperate.value || !resolvedOrderId || !note || rejectingOrderId.value) return

  rejectingOrderId.value = resolvedOrderId
  try {
    await runOrderAction(() => rejectOrder(resolvedOrderId, note))
  } finally {
    if (rejectingOrderId.value === resolvedOrderId) rejectingOrderId.value = ''
  }
}

function estimateMinutes(order: Record<string, unknown>) {
  return estimateMinutesForId(normalizeId(order.id), Number(order.estimated_ready_minutes || 0))
}

function estimateMinutesForId(orderId: string, fallback = 0) {
  return estimatesByOrderId.value[orderId] ||
    clampEstimate(fallback || defaultEstimateMinutes)
}

function setEstimateMinutes(orderId: string, value: unknown) {
  if (!canOperate.value) return
  const resolvedOrderId = normalizeId(orderId)
  if (!resolvedOrderId) return
  estimatesByOrderId.value = {
    ...estimatesByOrderId.value,
    [resolvedOrderId]: clampEstimate(Number(value)),
  }
}

function nudgeEstimateMinutes(orderId: string, amount: number) {
  if (!canOperate.value) return
  const resolvedOrderId = normalizeId(orderId)
  setEstimateMinutes(
    resolvedOrderId,
    estimateMinutesForId(resolvedOrderId) + amount
  )
}

function clampEstimate(value: number) {
  const minutes = Math.round((Number(value) || defaultEstimateMinutes) / 5) * 5
  return Math.min(90, Math.max(5, minutes))
}

async function markOrderReady(orderId: string) {
  const resolvedOrderId = normalizeId(orderId)
  await runOrderAction(() => markOrderReadyFromConsole(resolvedOrderId))
}

async function returnPassOrder(orderId: string) {
  const resolvedOrderId = normalizeId(orderId)
  await runOrderAction(() => returnOrderToQueue(resolvedOrderId))
}

function canInteractWith(order: KitchenOrder) {
  return canOperate.value && !isOrderTransitioning(order.id)
}

function isOrderTransitioning(orderId: unknown) {
  return isOrderTransitioningFromConsole(normalizeId(orderId))
}

async function runOrderAction(action: () => Promise<unknown> | unknown) {
  if (!canOperate.value) return
  try {
    await action()
  } catch {
    // The transition mutation exposes the display error.
  }
}
</script>

<style scoped>
.orders-board,
.orders-board__content,
.orders-board__lanes,
.orders-board__unmapped {
  display: grid;
}

.orders-board,
.orders-board__content,
.orders-board__lanes {
  gap: 0.75rem;
}

.orders-board__content,
.orders-board__lanes {
  align-items: start;
}

.orders-board__loading {
  display: grid;
  min-height: 12rem;
  place-items: center;
  color: var(--ui-text-dimmed);
  font-size: 0.875rem;
}

.orders-board__unmapped {
  gap: 0.5rem;
}

@media (min-width: 768px) {
  .orders-board__lanes,
  .orders-board__unmapped {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (min-width: 1280px) {
  .orders-board__lanes {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .orders-board__unmapped {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}
</style>
