<template>
  <div class="grid gap-4">
    <header class="flex flex-col gap-4 rounded-lg border border-default bg-elevated p-4 sm:flex-row sm:items-center sm:justify-between">
      <div class="grid min-w-36 gap-0.5">
        <p class="m-0 text-xs font-extrabold uppercase text-muted">
          Order intake
        </p>
        <h1 class="m-0 text-2xl font-black leading-none text-highlighted">
          Live board
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
        :disabled="readOnly || !canWrite || clearingOrders || !allVisibleOrders.length"
        @click="clearOrders"
      >
        {{ clearButtonLabel }}
      </UButton>
    </header>

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
            header-action-label="Move order back to queue"
            :status-action-label="sendLabel(ticket)"
            :status-action-aria-label="sendAriaLabel(ticket)"
            @touch-header="moveToQueue"
            @touch-status="sendOrder"
          />
        </div>

        <p v-else class="m-0 text-sm font-semibold text-muted">
          Nothing on the pass.
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
            header-action-label="Mark order ready"
            body-action-label="Mark order ready"
            @touch-header="passOrder"
            @touch-body="passOrder"
          />
        </div>

        <p v-else class="m-0 text-sm font-semibold text-muted">
          No queued orders.
        </p>
      </section>

      <section class="grid gap-4 rounded-lg border border-default bg-elevated/80 p-4">
        <div class="flex items-center justify-between gap-3">
          <h2 class="m-0 text-sm font-extrabold text-highlighted">
            Recent
          </h2>
          <UBadge color="neutral" variant="soft">
            {{ archiveOrders.length }}
          </UBadge>
        </div>

        <div
          v-if="archiveOrders.length"
          class="grid gap-3 sm:grid-cols-2 xl:grid-cols-3"
        >
          <ConsoleKitchenOperationsOrdersCardsTicket
            v-for="ticket in archiveOrders"
            :key="ticket.id"
            :order="ticket"
          />
        </div>

        <p v-else class="m-0 text-sm font-semibold text-muted">
          No recent orders yet.
        </p>
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
  archiveOrders,
  pending,
  readOnly,
  canWrite,
  acceptOrder,
  rejectOrder,
  queueOrder,
  passOrder,
  archiveOrder,
  trashOrder,
} = useKitchenConsoleOrders()

const normalizeId = (value: unknown) => String(value ?? '').trim()
const railCounts = computed(() => [
  {
    label: 'Incoming',
    count: incomingOrders.value.length,
  },
  {
    label: 'Pass',
    count: passOrders.value.length,
  },
  {
    label: 'Queue',
    count: queueOrders.value.length,
  },
  {
    label: 'Recent',
    count: archiveOrders.value.length,
  },
])
const allVisibleOrders = computed(() => [
  ...incomingOrders.value,
  ...passOrders.value,
  ...queueOrders.value,
  ...archiveOrders.value,
])
const clearButtonLabel = computed(() => {
  if (clearingOrders.value) return 'Clearing...'
  if (clearConfirm.value) return `Clear ${allVisibleOrders.value.length}`
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

function moveToQueue(orderId: string) {
  const resolvedOrderId = normalizeId(orderId)
  if (sendReadyOrderId.value === resolvedOrderId) sendReadyOrderId.value = ''
  queueOrder(resolvedOrderId)
}

async function acceptIncomingOrder(
  payload: { id: string; estimatedMinutes: number | null }
) {
  const resolvedOrderId = normalizeId(payload.id)
  if (!resolvedOrderId || acceptingOrderId.value) return

  acceptingOrderId.value = resolvedOrderId
  try {
    await acceptOrder(resolvedOrderId, payload.estimatedMinutes)
  } finally {
    if (acceptingOrderId.value === resolvedOrderId) acceptingOrderId.value = ''
  }
}

async function rejectIncomingOrder(payload: { id: string; note: string }) {
  const resolvedOrderId = normalizeId(payload.id)
  const note = payload.note.trim()
  if (!resolvedOrderId || !note || rejectingOrderId.value) return

  rejectingOrderId.value = resolvedOrderId
  try {
    await rejectOrder(resolvedOrderId, note)
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
  const resolvedOrderId = normalizeId(orderId)
  if (!resolvedOrderId) return
  estimatesByOrderId.value = {
    ...estimatesByOrderId.value,
    [resolvedOrderId]: clampEstimate(Number(value)),
  }
}

function nudgeEstimateMinutes(orderId: string, amount: number) {
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

function sendOrder(orderId: string) {
  const resolvedOrderId = normalizeId(orderId)
  if (!resolvedOrderId) return
  if (sendReadyOrderId.value !== resolvedOrderId) {
    sendReadyOrderId.value = resolvedOrderId
    return
  }

  sendReadyOrderId.value = ''
  archiveOrder(resolvedOrderId)
}

async function clearOrders() {
  if (readOnly.value || !canWrite.value || clearingOrders.value) return
  const orderIds = allVisibleOrders.value
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
  } finally {
    clearingOrders.value = false
    clearConfirm.value = false
  }
}
</script>
