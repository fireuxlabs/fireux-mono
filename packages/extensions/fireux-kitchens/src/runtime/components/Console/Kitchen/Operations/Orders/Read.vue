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
        color="neutral"
        :variant="trashMode ? 'solid' : 'soft'"
        :icon="trashMode ? 'i-lucide-trash-2' : 'i-lucide-trash'"
        :disabled="readOnly || !canWrite"
        @click="trashMode = !trashMode"
      >
        {{ trashMode ? 'No trash' : 'Trash' }}
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
          <ConsoleKitchenOperationsOrdersCardsTicket
            v-for="ticket in incomingOrders"
            :key="ticket.id"
            :order="ticket"
            :trash-mode="trashMode"
            :status-action-label="acceptLabel(ticket.id)"
            :status-action-aria-label="acceptAriaLabel(ticket.id)"
            :status-action-pending="acceptingOrderId === normalizeId(ticket.id)"
            @touch-status="acceptOrderWithEta"
            @trash="trashOrder"
          />
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
            :trash-mode="trashMode"
            header-action-label="Move order back to queue"
            :status-action-label="sendLabel(ticket.id)"
            :status-action-aria-label="sendAriaLabel(ticket.id)"
            @touch-header="moveToQueue"
            @touch-status="sendOrder"
            @trash="trashOrder"
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
            :trash-mode="trashMode"
            header-action-label="Move order to pass"
            body-action-label="Move order to pass"
            @touch-header="passOrder"
            @touch-body="passOrder"
            @trash="trashOrder"
          />
        </div>

        <p v-else class="kitchen-orders-empty">
          No queued orders.
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

const trashMode = ref(false)
const sendReadyOrderId = ref('')
const acceptingOrderId = ref('')
const acceptEstimateMinutes = 45
const {
  incomingOrders,
  queueOrders,
  passOrders,
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
])

function acceptLabel(orderId: string) {
  return acceptingOrderId.value === normalizeId(orderId)
    ? 'accepting...'
    : `accept · ${acceptEstimateMinutes} min`
}

function acceptAriaLabel(orderId: string) {
  return acceptingOrderId.value === normalizeId(orderId)
    ? 'Accepting order'
    : `Accept order with ${acceptEstimateMinutes} minute estimate`
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
    await acceptOrder(resolvedOrderId, acceptEstimateMinutes)
  } finally {
    if (acceptingOrderId.value === resolvedOrderId) acceptingOrderId.value = ''
  }
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
