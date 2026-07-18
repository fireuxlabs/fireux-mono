<template>
  <div class="grid gap-3" data-kitchen-orders-board>
    <ConsoleKitchenOperationsOrdersToolbar
      :read-only="readOnly"
      :visible-count="visibleOrders.length"
      :pass-count="passOrders.length"
      :selected-count="selectedPassOrders.length"
      :can-return="canReturnSelectedPassOrders"
      :returning="returningPassOrders"
      :can-send="canSendSelectedPassOrders"
      :sending="sendingPassOrders"
      :can-clear="canClearOrders"
      :clear-confirm="clearConfirm"
      :clearing="clearingOrders"
      :clear-label="clearButtonLabel"
      :can-end-service="canEndService"
      :end-service-confirm="endServiceConfirm"
      :ending-service="servicePending"
      :end-service-label="endServiceButtonLabel"
      @return="returnSelectedPassOrders"
      @send="sendSelectedPassOrders"
      @clear="clearOrders"
      @end-service="endCurrentService"
    />

    <UAlert
      v-if="transitionError || serviceError"
      color="error"
      variant="soft"
      icon="i-lucide-circle-alert"
      title="Order action failed"
      :description="transitionError || serviceError"
    />

    <div
      v-if="pending"
      class="grid min-h-48 place-items-center rounded-lg border border-dashed border-default text-sm text-dimmed"
      role="status"
    >
      Loading orders…
    </div>

    <div v-else class="grid items-start gap-3">
      <div
        class="flex min-w-0 gap-3 overflow-x-auto overscroll-x-contain border-b border-default pb-3 [&>*]:w-[min(20rem,82vw)] [&>*]:shrink-0 xl:[&>*]:w-80"
        data-order-rail="pass"
      >
        <ConsoleKitchenOperationsOrdersCardsTicket
          v-for="ticket in passOrders"
          :key="ticket.id"
          :order="ticket"
          :interactive="canInteractWith(ticket)"
          prominent
          :selected="isPassOrderSelected(ticket.id)"
          :body-action-label="isPassOrderSelected(ticket.id)
            ? 'Remove order from send selection'
            : 'Select order to send'"
          @touch-body="togglePassOrderSelection"
        />
      </div>

      <div class="grid items-start gap-3 md:grid-cols-2 xl:grid-cols-3">
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
import { useKitchenOrderPassSelection } from '../../../../../composables/fireux/console/kitchen/operations/Orders/useKitchenOrderPassSelection'
import type { KitchenOrder } from '../../../../../models/kitchen/order.model'

const clearConfirm = ref(false)
const clearingOrders = ref(false)
const endServiceConfirm = ref(false)
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
  serviceError,
  servicePending,
  transitioningCount,
  isOrderTransitioning: isOrderTransitioningFromConsole,
  acceptOrder,
  rejectOrder,
  returnOrderToQueue,
  markOrderReady: markOrderReadyFromConsole,
  completeOrder,
  trashOrder,
  endService,
} = useKitchenConsoleOrders()

const normalizeId = (value: unknown) => String(value ?? '').trim()
const canOperate = computed(() => canWrite.value && !readOnly.value)
const {
  canReturn: canReturnSelectedPassOrders,
  canSend: canSendSelectedPassOrders,
  isSelected: isPassOrderSelected,
  returning: returningPassOrders,
  returnToQueue: returnSelectedPassOrders,
  selectedOrders: selectedPassOrders,
  send: sendSelectedPassOrders,
  sending: sendingPassOrders,
  toggle: togglePassOrderSelection,
} = useKitchenOrderPassSelection({
  canOperate,
  orders: passOrders,
  isTransitioning: isOrderTransitioning,
  completeOrder,
  returnOrderToQueue,
})
const activeOrderCount = computed(() =>
  incomingOrders.value.length + queueOrders.value.length + passOrders.value.length
)
const canEndService = computed(() =>
  canOperate.value &&
    activeOrderCount.value === 0 &&
    !servicePending.value &&
    !transitioningCount.value
)
const canClearOrders = computed(() =>
  canOperate.value && !clearingOrders.value && !transitioningCount.value
)
const endServiceButtonLabel = computed(() => {
  if (servicePending.value) return 'Ending service…'
  if (activeOrderCount.value) return `${activeOrderCount.value} active`
  if (endServiceConfirm.value) return 'Confirm end service'
  return 'End service'
})
const clearButtonLabel = computed(() => {
  if (clearingOrders.value) return 'Clearing...'
  if (clearConfirm.value) return `Trash ${visibleOrders.value.length} orders`
  return 'Clear board'
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

async function endCurrentService() {
  if (!canEndService.value) return
  if (!endServiceConfirm.value) {
    endServiceConfirm.value = true
    return
  }

  try {
    await endService()
    endServiceConfirm.value = false
  } catch {
    // The service mutation exposes the display error.
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
