<template>
  <div class="kitchen-orders-board">
    <header class="kitchen-orders-toolbar">
      <div class="kitchen-orders-toolbar__copy">
        <p>Order intake</p>
        <h1>Live board</h1>
      </div>

      <div class="kitchen-orders-toolbar__stats">
        <div
          v-for="count in railCounts"
          :key="count.label"
          class="kitchen-orders-stat"
        >
          <span>{{ count.label }}</span>
          <strong>{{ count.count }}</strong>
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

    <p v-if="pending" class="kitchen-orders-empty">
      Loading orders...
    </p>

    <div v-else class="kitchen-orders-lanes">
      <section class="kitchen-orders-rail kitchen-orders-rail--incoming">
        <div class="kitchen-orders-rail__header">
          <h2>
            Incoming
          </h2>
          <UBadge color="neutral" variant="soft">
            {{ incomingOrders.length }}
          </UBadge>
        </div>

        <div
          v-if="incomingOrders.length"
          class="kitchen-orders-rail__grid"
        >
          <article
            v-for="ticket in incomingOrders"
            :key="ticket.id"
            class="kitchen-orders-cta"
          >
            <header class="kitchen-orders-cta__header">
              <div class="kitchen-orders-cta__title">
                <UIcon
                  v-if="isDeliveryOrder(ticket)"
                  name="i-lucide-bike"
                  class="kitchen-orders-cta__icon"
                  aria-hidden="true"
                />

                <div>
                  <p>Incoming</p>
                  <h3>{{ isPaymentPending(ticket) ? 'Payment pending' : 'Set cooking time' }}</h3>
                </div>
              </div>

            </header>

            <div class="kitchen-orders-cta__lines">
              <p
                v-for="line in orderLines(ticket)"
                :key="line.id"
              >
                {{ line.quantity }}x {{ line.label }}
              </p>
            </div>

            <div v-if="!isPaymentPending(ticket)" class="kitchen-orders-eta">
              <label :for="`eta-${normalizeId(ticket.id)}`">
                Cooking time
                <strong>{{ estimateMinutes(ticket) }} min</strong>
              </label>

              <input
                :id="`eta-${normalizeId(ticket.id)}`"
                type="range"
                min="5"
                max="90"
                step="5"
                :value="estimateMinutes(ticket)"
                @input="setEstimateMinutes(normalizeId(ticket.id), ($event.target as HTMLInputElement).value)"
              >

              <div class="kitchen-orders-eta__actions">
                <button
                  type="button"
                  @click="nudgeEstimateMinutes(normalizeId(ticket.id), -5)"
                >
                  -5
                </button>

                <button
                  type="button"
                  class="kitchen-orders-eta__accept"
                  :disabled="acceptingOrderId === normalizeId(ticket.id)"
                  @click="acceptOrderWithEta(normalizeId(ticket.id))"
                >
                  {{ acceptingOrderId === normalizeId(ticket.id) ? 'Accepting...' : `Accept · ${estimateMinutes(ticket)} min` }}
                </button>

                <button
                  type="button"
                  @click="nudgeEstimateMinutes(normalizeId(ticket.id), 5)"
                >
                  +5
                </button>
              </div>
            </div>
          </article>
        </div>

        <p v-else class="kitchen-orders-empty">
          No incoming orders waiting for acceptance.
        </p>
      </section>

      <section class="kitchen-orders-rail kitchen-orders-rail--pass">
        <div class="kitchen-orders-rail__header">
          <h2>
            Pass
          </h2>
          <UBadge color="neutral" variant="soft">
            {{ passOrders.length }}
          </UBadge>
        </div>

        <div
          v-if="passOrders.length"
          class="kitchen-orders-rail__grid"
        >
          <ConsoleKitchenOperationsOrdersCardsTicket
            v-for="ticket in passOrders"
            :key="ticket.id"
            :order="ticket"
            header-action-label="Move order back to queue"
            :status-action-label="sendLabel(ticket.id)"
            :status-action-aria-label="sendAriaLabel(ticket.id)"
            @touch-header="moveToQueue"
            @touch-status="sendOrder"
          />
        </div>

        <p v-else class="kitchen-orders-empty">
          Nothing on the pass.
        </p>
      </section>

      <section class="kitchen-orders-rail kitchen-orders-rail--queue">
        <div class="kitchen-orders-rail__header">
          <h2>
            Queue
          </h2>
          <UBadge color="neutral" variant="soft">
            {{ queueOrders.length }}
          </UBadge>
        </div>

        <div
          v-if="queueOrders.length"
          class="kitchen-orders-rail__grid"
        >
          <ConsoleKitchenOperationsOrdersCardsTicket
            v-for="ticket in queueOrders"
            :key="ticket.id"
            :order="ticket"
            header-action-label="Move order to pass"
            body-action-label="Move order to pass"
            @touch-header="passOrder"
            @touch-body="passOrder"
          />
        </div>

        <p v-else class="kitchen-orders-empty">
          No queued orders.
        </p>
      </section>

      <section class="kitchen-orders-rail kitchen-orders-rail--recent">
        <div class="kitchen-orders-rail__header">
          <h2>
            Recent
          </h2>
          <UBadge color="neutral" variant="soft">
            {{ archiveOrders.length }}
          </UBadge>
        </div>

        <div
          v-if="archiveOrders.length"
          class="kitchen-orders-rail__grid"
        >
          <ConsoleKitchenOperationsOrdersCardsTicket
            v-for="ticket in archiveOrders"
            :key="ticket.id"
            :order="ticket"
          />
        </div>

        <p v-else class="kitchen-orders-empty">
          No recent orders yet.
        </p>
      </section>
    </div>

    <DevFireuxDebugPanel
      title="Kitchen orders"
      scope="console"
      :data="debug"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useKitchenConsoleOrders } from '../../../../../composables/fireux/console/kitchen/operations/Orders/useKitchenConsoleOrders'

const clearConfirm = ref(false)
const clearingOrders = ref(false)
const sendReadyOrderId = ref('')
const acceptingOrderId = ref('')
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
  queueOrder,
  passOrder,
  archiveOrder,
  trashOrder,
  debug,
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

function isPaymentPending(order: Record<string, unknown>) {
  return normalizeId(order.status) === 'pending_payment'
}

function isDeliveryOrder(order: Record<string, unknown>) {
  return normalizeId(order.order_type) === 'delivery'
}

function sendLabel(orderId: string) {
  return sendReadyOrderId.value === normalizeId(orderId) ? 'send' : 'on pass'
}

function sendAriaLabel(orderId: string) {
  return sendReadyOrderId.value === normalizeId(orderId)
    ? 'Send order'
    : 'Confirm send order'
}

function moveToQueue(orderId: string) {
  const resolvedOrderId = normalizeId(orderId)
  if (sendReadyOrderId.value === resolvedOrderId) sendReadyOrderId.value = ''
  queueOrder(resolvedOrderId)
}

async function acceptOrderWithEta(orderId: string) {
  const resolvedOrderId = normalizeId(orderId)
  if (!resolvedOrderId || acceptingOrderId.value) return

  acceptingOrderId.value = resolvedOrderId
  try {
    await acceptOrder(resolvedOrderId, estimateMinutesForId(resolvedOrderId))
  } finally {
    if (acceptingOrderId.value === resolvedOrderId) acceptingOrderId.value = ''
  }
}

function orderLines(order: Record<string, unknown>) {
  const items = Array.isArray(order.items) ? order.items : []
  return items.map((item, index) => {
    const row = item && typeof item === 'object' && !Array.isArray(item)
      ? item as Record<string, unknown>
      : {}

    return {
      id: normalizeId(row.id) || `line-${index + 1}`,
      label: normalizeId(row.label) || 'ping',
      quantity: Math.max(1, Number(row.quantity || 1) || 1),
    }
  })
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

<style scoped>
.kitchen-orders-board {
  display: grid;
  gap: 1rem;
}

.kitchen-orders-toolbar {
  display: flex;
  gap: 1rem;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  border: 1px solid var(--ui-border);
  border-radius: 1.25rem;
  background:
    radial-gradient(circle at top left, color-mix(in srgb, var(--ui-primary) 12%, transparent), transparent 34rem),
    var(--ui-bg-elevated);
}

.kitchen-orders-toolbar__copy {
  display: grid;
  gap: 0.1rem;
  min-width: 9rem;
}

.kitchen-orders-toolbar__copy p,
.kitchen-orders-toolbar__copy h1 {
  margin: 0;
}

.kitchen-orders-toolbar__copy p {
  color: var(--ui-text-muted);
  font-size: 0.75rem;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.kitchen-orders-toolbar__copy h1 {
  color: var(--ui-text-highlighted);
  font-size: clamp(1.4rem, 3vw, 2rem);
  font-weight: 900;
  letter-spacing: -0.05em;
  line-height: 0.95;
}

.kitchen-orders-toolbar__stats {
  display: flex;
  flex: 1;
  flex-wrap: wrap;
  gap: 0.5rem;
  justify-content: flex-end;
}

.kitchen-orders-stat {
  display: grid;
  min-width: 5.5rem;
  padding: 0.55rem 0.75rem;
  border: 1px solid color-mix(in srgb, var(--ui-border) 72%, transparent);
  border-radius: 0.9rem;
  background: color-mix(in srgb, var(--ui-bg) 86%, transparent);
}

.kitchen-orders-stat span {
  color: var(--ui-text-muted);
  font-size: 0.72rem;
  font-weight: 750;
}

.kitchen-orders-stat strong {
  color: var(--ui-text-highlighted);
  font-size: 1.25rem;
  font-weight: 900;
  line-height: 1;
}

.kitchen-orders-lanes,
.kitchen-orders-rail {
  display: grid;
  gap: 1rem;
}

.kitchen-orders-rail {
  padding: 1rem;
  border: 1px solid var(--ui-border);
  border-radius: 1.25rem;
  background: color-mix(in srgb, var(--ui-bg-elevated) 88%, transparent);
}

.kitchen-orders-rail--incoming {
  border-color: color-mix(in srgb, var(--ui-primary) 28%, var(--ui-border));
}

.kitchen-orders-rail__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
}

.kitchen-orders-rail__header h2 {
  margin: 0;
  color: var(--ui-text-highlighted);
  font-size: 0.95rem;
  font-weight: 850;
  letter-spacing: -0.02em;
}

.kitchen-orders-rail__grid {
  display: grid;
  gap: 0.75rem;
  grid-template-columns: repeat(auto-fit, minmax(18rem, 1fr));
}

.kitchen-orders-cta {
  display: grid;
  gap: 0.9rem;
  max-width: 22rem;
  padding: 1rem;
  border: 1px solid color-mix(in srgb, var(--ui-primary) 24%, var(--ui-border));
  border-radius: 1rem;
  background: var(--ui-bg);
  box-shadow: 0 0.75rem 1.75rem color-mix(in srgb, var(--ui-text) 8%, transparent);
}

.kitchen-orders-cta__header {
  display: flex;
  gap: 0.75rem;
  align-items: flex-start;
  justify-content: space-between;
}

.kitchen-orders-cta__title {
  display: flex;
  gap: 0.65rem;
  align-items: flex-start;
  min-width: 0;
}

.kitchen-orders-cta__icon {
  width: 1.35rem;
  height: 1.35rem;
  margin-top: 0.1rem;
  color: var(--ui-primary);
}

.kitchen-orders-cta__header p,
.kitchen-orders-cta__header h3,
.kitchen-orders-cta__lines p {
  margin: 0;
}

.kitchen-orders-cta__header p {
  color: var(--ui-text-muted);
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.kitchen-orders-cta__header h3 {
  color: var(--ui-text-highlighted);
  font-size: 1.1rem;
  font-weight: 900;
  letter-spacing: -0.04em;
}

.kitchen-orders-cta__lines {
  display: grid;
  gap: 0.25rem;
  color: var(--ui-text-highlighted);
  font-size: 0.95rem;
  font-weight: 750;
}

.kitchen-orders-eta {
  display: grid;
  gap: 0.65rem;
}

.kitchen-orders-eta label {
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: var(--ui-text-muted);
  font-size: 0.82rem;
  font-weight: 750;
}

.kitchen-orders-eta label strong {
  color: var(--ui-text-highlighted);
  font-size: 1rem;
  font-weight: 900;
}

.kitchen-orders-eta input {
  width: 100%;
}

.kitchen-orders-eta__actions {
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 0.45rem;
}

.kitchen-orders-eta__actions button {
  min-height: 2.45rem;
  padding: 0.5rem 0.7rem;
  border: 1px solid var(--ui-border);
  border-radius: 999px;
  background: var(--ui-bg-elevated);
  color: var(--ui-text-highlighted);
  cursor: pointer;
  font: inherit;
  font-size: 0.84rem;
  font-weight: 850;
}

.kitchen-orders-eta__actions .kitchen-orders-eta__accept {
  border-color: transparent;
  background: var(--ui-primary);
  color: var(--ui-bg);
}

.kitchen-orders-eta__actions button:disabled {
  cursor: not-allowed;
  opacity: 0.55;
}

.kitchen-orders-empty {
  margin: 0;
  color: var(--ui-text-muted);
  font-size: 0.9rem;
  font-weight: 650;
}

@media (max-width: 760px) {
  .kitchen-orders-toolbar {
    align-items: stretch;
    flex-direction: column;
  }

  .kitchen-orders-toolbar__stats {
    justify-content: stretch;
  }

  .kitchen-orders-stat {
    flex: 1;
  }
}
</style>
