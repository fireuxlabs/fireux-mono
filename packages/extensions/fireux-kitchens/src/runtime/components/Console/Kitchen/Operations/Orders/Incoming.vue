<template>
  <UButton
    v-if="incomingOrders.length"
    color="warning"
    variant="soft"
    icon="i-lucide-inbox"
    :label="`Incoming ${incomingOrders.length}`"
    @click="incomingOpen = true"
  />

  <UModal
    v-model="incomingOpen"
    title="Incoming orders"
    :description="incomingDescription"
    scrollable
  >
    <template #body>
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
          :can-interact="canInteract(ticket)"
          :order="ticket"
          :rejecting="rejectingOrderId === normalizeId(ticket.id)"
          @accept="acceptIncomingOrder"
          @nudge-estimate="nudgeEstimateMinutes($event.id, $event.amount)"
          @reject="rejectIncomingOrder"
          @set-estimate="setEstimateMinutes($event.id, $event.minutes)"
        />
      </ConsoleKitchenOperationsOrdersRail>
    </template>
  </UModal>
</template>

<script setup lang="ts">
import {
  computed,
  ref,
  watch,
} from 'vue'
import { useKitchenOrdersWorkspace } from '../../../../../composables/fireux/console/kitchen/operations/Orders/useKitchenOrdersWorkspace'

defineOptions({ name: 'ConsoleKitchenOperationsOrdersIncoming' })

const defaultEstimateMinutes = 45
const incomingOpen = ref(false)
const acceptingOrderId = ref('')
const rejectingOrderId = ref('')
const estimatesByOrderId = ref<Record<string, number>>({})
const {
  incomingOrders,
  canOperate,
  canInteract,
  normalizeId,
  acceptOrder,
  rejectOrder,
} = useKitchenOrdersWorkspace()
const incomingDescription = computed(() =>
  incomingOrders.value.length === 1
    ? '1 order is waiting for a decision.'
    : `${incomingOrders.value.length} orders are waiting for a decision.`
)

watch(
  () => incomingOrders.value.length,
  (count) => {
    if (!count) incomingOpen.value = false
  }
)

async function acceptIncomingOrder(
  payload: { id: string; estimatedMinutes: number | null }
) {
  const orderId = normalizeId(payload.id)
  if (!canOperate.value || !orderId || acceptingOrderId.value) return

  acceptingOrderId.value = orderId
  try {
    await acceptOrder(orderId, payload.estimatedMinutes)
  } catch {
    // The transition mutation owns the operator-facing error state.
  } finally {
    if (acceptingOrderId.value === orderId) acceptingOrderId.value = ''
  }
}

async function rejectIncomingOrder(payload: { id: string; note: string }) {
  const orderId = normalizeId(payload.id)
  const note = payload.note.trim()
  if (!canOperate.value || !orderId || !note || rejectingOrderId.value) return

  rejectingOrderId.value = orderId
  try {
    await rejectOrder(orderId, note)
  } catch {
    // The transition mutation owns the operator-facing error state.
  } finally {
    if (rejectingOrderId.value === orderId) rejectingOrderId.value = ''
  }
}

function estimateMinutes(order: Record<string, unknown>) {
  const orderId = normalizeId(order.id)
  return estimatesByOrderId.value[orderId] || clampEstimate(
    Number(order.estimated_ready_minutes || defaultEstimateMinutes)
  )
}

function setEstimateMinutes(orderId: string, value: unknown) {
  if (!canOperate.value) return
  const id = normalizeId(orderId)
  if (!id) return

  estimatesByOrderId.value = {
    ...estimatesByOrderId.value,
    [id]: clampEstimate(Number(value)),
  }
}

function nudgeEstimateMinutes(orderId: string, amount: number) {
  const id = normalizeId(orderId)
  setEstimateMinutes(
    id,
    (estimatesByOrderId.value[id] || defaultEstimateMinutes) + amount
  )
}

function clampEstimate(value: number) {
  const minutes = Math.round((Number(value) || defaultEstimateMinutes) / 5) * 5
  return Math.min(90, Math.max(5, minutes))
}
</script>
