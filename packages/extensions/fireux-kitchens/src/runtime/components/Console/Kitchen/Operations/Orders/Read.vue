<template>
  <div class="grid gap-3" data-kitchen-orders-board>
    <header class="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-default pb-3">
      <div class="flex min-w-0 items-center gap-2">
        <h1 class="m-0 text-xl font-bold leading-none text-highlighted">
          Orders
        </h1>
        <UBadge :color="readOnly ? 'neutral' : 'success'" variant="soft" size="sm">
          {{ readOnly ? 'Demo' : 'Live' }}
        </UBadge>
      </div>

      <p class="m-0 min-w-0 flex-1 text-xs text-dimmed">
        {{ visibleOrders.length }} on board
      </p>

      <UButton
        v-if="visibleOrders.length"
        size="xs"
        color="error"
        :variant="clearConfirm ? 'soft' : 'ghost'"
        :icon="clearConfirm ? 'i-lucide-trash-2' : 'i-lucide-trash'"
        :disabled="readOnly || !canWrite || clearingOrders || Boolean(transitioningCount)"
        :aria-label="clearButtonLabel"
        @click="clearOrders"
      >
        <span v-if="clearConfirm || clearingOrders">{{ clearButtonLabel }}</span>
      </UButton>
    </header>

    <UAlert
      v-if="transitionError"
      color="error"
      variant="soft"
      icon="i-lucide-circle-alert"
      title="Order action failed"
      :description="transitionError"
    />

    <div
      v-if="pending"
      class="grid min-h-48 place-items-center rounded-lg border border-dashed border-default text-sm text-dimmed"
      role="status"
    >
      Loading orders…
    </div>

    <div v-else class="grid items-start gap-3 md:grid-cols-2 xl:grid-cols-4">
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
        <ConsoleKitchenOperationsOrdersCardsTicket
          v-for="ticket in queueOrders"
          :key="ticket.id"
          :order="ticket"
          :interactive="canInteractWith(ticket)"
          status-action-label="Ready"
          status-action-aria-label="Mark order ready"
          :status-action-pending="isOrderTransitioning(ticket.id)"
          @touch-status="markOrderReady"
        />
      </ConsoleKitchenOperationsOrdersRail>

      <ConsoleKitchenOperationsOrdersRail
        label="Pass"
        :count="passOrders.length"
        empty-label="Nothing waiting for handoff"
        accent="success"
      >
        <ConsoleKitchenOperationsOrdersCardsTicket
          v-for="ticket in passOrders"
          :key="ticket.id"
          :order="ticket"
          :interactive="canInteractWith(ticket)"
          header-action-label="Move order back to queue"
          :status-action-label="sendLabel(ticket)"
          :status-action-aria-label="sendAriaLabel(ticket)"
          :status-action-pending="isOrderTransitioning(ticket.id)"
          @touch-header="returnToQueue"
          @touch-status="completeReadyOrder"
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

      <ConsoleKitchenOperationsOrdersRail
        v-if="unmappedOrders.length"
        class="md:col-span-2 xl:col-span-4"
        label="Needs mapping"
        :count="unmappedOrders.length"
        empty-label="No unmapped orders"
        accent="warning"
      >
        <div class="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
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
import { kitchenOrderHandoffActionLabel } from '../../../../../composables/fireux/console/kitchen/operations/Orders/useKitchenOrderTicket'
import type { KitchenOrder } from '../../../../../models/kitchen/order.model'

const clearConfirm = ref(false)
const clearingOrders = ref(false)
const sendReadyOrderId = ref('')
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
  visibleOrders,
  pending,
  readOnly,
  canWrite,
  transitionError,
  transitioningCount,
  isOrderTransitioning: isOrderTransitioningFromConsole,
  acceptOrder,
  rejectOrder,
  returnOrderToQueue,
  markOrderReady: markOrderReadyFromConsole,
  completeOrder,
  trashOrder,
} = useKitchenConsoleOrders()

const normalizeId = (value: unknown) => String(value ?? '').trim()
const canOperate = computed(() => canWrite.value && !readOnly.value)
const clearButtonLabel = computed(() => {
  if (clearingOrders.value) return 'Clearing...'
  if (clearConfirm.value) return `Trash ${visibleOrders.value.length} orders`
  return 'Clear board'
})

function sendLabel(order: KitchenOrder) {
  return sendReadyOrderId.value === normalizeId(order.id)
    ? 'Confirm'
    : kitchenOrderHandoffActionLabel(order)
}

function sendAriaLabel(order: KitchenOrder) {
  const action = kitchenOrderHandoffActionLabel(order)
  return sendReadyOrderId.value === normalizeId(order.id)
    ? `Confirm ${action.toLowerCase()}`
    : action
}

async function returnToQueue(orderId: string) {
  const resolvedOrderId = normalizeId(orderId)
  if (sendReadyOrderId.value === resolvedOrderId) sendReadyOrderId.value = ''
  await runOrderAction(() => returnOrderToQueue(resolvedOrderId))
}

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

async function completeReadyOrder(orderId: string) {
  if (!canOperate.value) return
  const resolvedOrderId = normalizeId(orderId)
  if (!resolvedOrderId || isOrderTransitioning(resolvedOrderId)) return
  if (sendReadyOrderId.value !== resolvedOrderId) {
    sendReadyOrderId.value = resolvedOrderId
    return
  }

  sendReadyOrderId.value = ''
  await runOrderAction(() => completeOrder(resolvedOrderId))
}

async function clearOrders() {
  if (readOnly.value || !canWrite.value || clearingOrders.value) return
  const orderIds = visibleOrders.value
    .map((order) => normalizeId(order.id))
    .filter(Boolean)
  if (!orderIds.length) return

  if (!clearConfirm.value) {
    clearConfirm.value = true
    return
  }

  clearingOrders.value = true
  try {
    await Promise.all(orderIds.map((orderId) => trashOrder(orderId)))
  } catch {
    // The transition mutation exposes the display error.
  } finally {
    clearingOrders.value = false
    clearConfirm.value = false
  }
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
