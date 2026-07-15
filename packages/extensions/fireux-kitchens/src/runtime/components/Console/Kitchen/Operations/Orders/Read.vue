<template>
  <div class="grid gap-4">
    <header class="flex flex-col gap-4 rounded-lg border border-default bg-elevated p-4 sm:flex-row sm:items-center sm:justify-between">
      <div class="grid min-w-36 gap-0.5">
        <p class="m-0 text-xs font-extrabold uppercase text-muted">
          Kitchen execution
        </p>
        <h1 class="m-0 text-2xl font-black leading-none text-highlighted">
          {{ readOnly ? 'Demo board' : 'Live board' }}
        </h1>
      </div>

      <div class="flex flex-1 flex-wrap gap-2 sm:justify-end">
        <div
          v-for="count in railCounts"
          :key="count.label"
          class="grid min-w-[5.5rem] flex-1 rounded-lg border border-default bg-default px-3 py-2 sm:flex-none"
        >
          <span class="text-xs font-bold text-muted">{{ count.label }}</span>
          <strong class="text-xl font-black leading-none text-highlighted">{{ count.count }}</strong>
        </div>
      </div>

      <UButton
        size="sm"
        color="error"
        :variant="clearConfirm ? 'solid' : 'soft'"
        :icon="clearConfirm ? 'i-lucide-trash-2' : 'i-lucide-trash'"
        :disabled="readOnly || !canWrite || clearingOrders || transitioningCount || !visibleOrders.length"
        @click="clearOrders"
      >
        {{ clearButtonLabel }}
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

    <p v-if="pending" class="m-0 text-sm font-semibold text-muted">
      Loading orders...
    </p>

    <div v-else class="grid gap-4">
      <section class="grid gap-4 rounded-lg border border-primary/30 bg-elevated/80 p-4">
        <div class="flex items-center justify-between gap-3">
          <h2 class="m-0 text-sm font-extrabold text-highlighted">
            Incoming
          </h2>
          <UBadge color="neutral" variant="soft">
            {{ incomingOrders.length }}
          </UBadge>
        </div>

        <div
          v-if="incomingOrders.length"
          class="grid gap-3 sm:grid-cols-2 xl:grid-cols-3"
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
        </div>

        <p v-else class="m-0 text-sm font-semibold text-muted">
          No incoming orders waiting for acceptance.
        </p>
      </section>

      <section class="grid gap-4 rounded-lg border border-default bg-elevated/80 p-4">
        <div class="flex items-center justify-between gap-3">
          <h2 class="m-0 text-sm font-extrabold text-highlighted">
            Queue
          </h2>
          <UBadge color="neutral" variant="soft">
            {{ queueOrders.length }}
          </UBadge>
        </div>

        <div
          v-if="queueOrders.length"
          class="grid gap-3 sm:grid-cols-2 xl:grid-cols-3"
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
        </div>

        <p v-else class="m-0 text-sm font-semibold text-muted">
          No queued orders.
        </p>
      </section>

      <section class="grid gap-4 rounded-lg border border-default bg-elevated/80 p-4">
        <div class="flex items-center justify-between gap-3">
          <h2 class="m-0 text-sm font-extrabold text-highlighted">
            Pass
          </h2>
          <UBadge color="neutral" variant="soft">
            {{ passOrders.length }}
          </UBadge>
        </div>

        <div
          v-if="passOrders.length"
          class="grid gap-3 sm:grid-cols-2 xl:grid-cols-3"
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
        </div>

        <p v-else class="m-0 text-sm font-semibold text-muted">
          Nothing on the pass.
        </p>
      </section>

      <section class="grid gap-4 rounded-lg border border-default bg-elevated/80 p-4">
        <div class="flex items-center justify-between gap-3">
          <h2 class="m-0 text-sm font-extrabold text-highlighted">
            Recent
          </h2>
          <UBadge color="neutral" variant="soft">
            {{ recentOrders.length }}
          </UBadge>
        </div>

        <div
          v-if="recentOrders.length"
          class="grid gap-3 sm:grid-cols-2 xl:grid-cols-3"
        >
          <ConsoleKitchenOperationsOrdersCardsTicket
            v-for="ticket in recentOrders"
            :key="ticket.id"
            :order="ticket"
          />
        </div>

        <p v-else class="m-0 text-sm font-semibold text-muted">
          No recent orders yet.
        </p>
      </section>

      <section
        v-if="unmappedOrders.length"
        class="grid gap-4 rounded-lg border border-warning/40 bg-warning/5 p-4"
      >
        <div class="flex items-center justify-between gap-3">
          <div>
            <h2 class="m-0 text-sm font-extrabold text-highlighted">
              Needs mapping
            </h2>
            <p class="m-0 text-xs font-semibold text-muted">
              These orders have a status the board does not recognise.
            </p>
          </div>
          <UBadge color="warning" variant="soft">
            {{ unmappedOrders.length }}
          </UBadge>
        </div>

        <div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          <ConsoleKitchenOperationsOrdersCardsTicket
            v-for="ticket in unmappedOrders"
            :key="ticket.id"
            :order="ticket"
          />
        </div>
      </section>
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
  railCounts,
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
  if (clearConfirm.value) return `Clear ${visibleOrders.value.length}`
  return 'Trash'
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
