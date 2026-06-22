<template>
  <div class="space-y-6">
    <div class="flex justify-end">
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
    </div>

    <p v-if="pending" class="text-sm text-dimmed">
      Loading orders...
    </p>

    <div v-else class="space-y-6">
      <section class="space-y-3">
        <div class="flex items-center justify-between gap-3">
          <h2 class="text-sm font-semibold text-highlighted">
            Pass
          </h2>
          <UBadge color="neutral" variant="soft">
            {{ passOrders.length }}
          </UBadge>
        </div>

        <div
          v-if="passOrders.length"
          class="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4"
        >
          <OrderCardsTicket
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

        <p v-else class="text-sm text-dimmed">
          Nothing on the pass.
        </p>
      </section>

      <section class="space-y-3">
        <div class="flex items-center justify-between gap-3">
          <h2 class="text-sm font-semibold text-highlighted">
            Queue
          </h2>
          <UBadge color="neutral" variant="soft">
            {{ queueOrders.length }}
          </UBadge>
        </div>

        <div
          v-if="queueOrders.length"
          class="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4"
        >
          <OrderCardsTicket
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

        <p v-else class="text-sm text-dimmed">
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
import { ref } from 'vue'
import { useKitchenConsoleOrders } from '../../../../../composables/fireux/console/kitchen/operations/Orders/useKitchenConsoleOrders'

const trashMode = ref(false)
const sendReadyOrderId = ref('')
const {
  queueOrders,
  passOrders,
  pending,
  readOnly,
  canWrite,
  queueOrder,
  passOrder,
  archiveOrder,
  trashOrder,
  debug,
} = useKitchenConsoleOrders()

const normalizeId = (value: unknown) => String(value ?? '').trim()

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
