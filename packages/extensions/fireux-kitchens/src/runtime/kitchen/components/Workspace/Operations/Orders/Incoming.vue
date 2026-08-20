<template>
  <UButton
    v-if="incomingOrders.length"
    color="warning"
    variant="soft"
    icon="i-lucide-inbox"
    :label="`Incoming ${incomingOrders.length}`"
    @click="incomingOpen = true"
  />

  <WorkspaceKitchenOperationsOrdersWorkspaceModal
    v-model:open="incomingOpen"
    title="Orders to accept"
    :description="incomingDescription"
  >
    <WorkspaceKitchenOperationsOrdersReceivingDesk
      :orders="incomingOrders"
      :accepting-order-id="acceptingOrderId"
      :rejecting-order-id="rejectingOrderId"
      :can-interact="canInteract"
      :estimate-for="estimateMinutes"
      :now-ms="currentTimeMs"
      @accept="acceptIncomingOrder"
      @accept-many="acceptIncomingOrders"
      @nudge-estimate="nudgeEstimateMinutes($event.id, $event.amount)"
      @reject="rejectIncomingOrder"
      @set-estimate="setEstimateMinutes($event.id, $event.minutes)"
    />
  </WorkspaceKitchenOperationsOrdersWorkspaceModal>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useKitchenOrdersWorkspace } from '../../../../composables/workspace/operations/Orders/useKitchenOrdersWorkspace'

defineOptions({ name: 'WorkspaceKitchenOperationsOrdersIncoming' })

const defaultEstimateMinutes = 45
const incomingOpen = ref(false)
const acceptingOrderId = ref('')
const rejectingOrderId = ref('')
const currentTimeMs = ref(Date.now())
const estimatesByOrderId = ref<Record<string, number>>({})
let minuteClock: number | undefined
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
    ? '1 customer order needs a kitchen decision.'
    : `${incomingOrders.value.length} customer orders need a kitchen decision.`
)
watch(
  () => incomingOrders.value.length,
  (count: number) => {
    if (!count) incomingOpen.value = false
  }
)

onMounted(() => {
  currentTimeMs.value = Date.now()
  minuteClock = window.setInterval(() => {
    currentTimeMs.value = Date.now()
  }, 60_000)
})

onBeforeUnmount(() => {
  if (minuteClock) window.clearInterval(minuteClock)
})

async function acceptIncomingOrder(payload: {
  id: string
  estimatedMinutes: number | null
}) {
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

async function acceptIncomingOrders(
  payloads: Array<{ id: string; estimatedMinutes: number | null }>
) {
  for (const payload of payloads) {
    await acceptIncomingOrder(payload)
  }
}

async function rejectIncomingOrder(payload: { id: string; note: string }) {
  const orderId = normalizeId(payload.id)
  const note = payload.note.trim()
  if (
    !canOperate.value ||
    !orderId ||
    !note ||
    rejectingOrderId.value ||
    acceptingOrderId.value
  )
    return

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
  return (
    estimatesByOrderId.value[orderId] ||
    clampEstimate(
      Number(order.estimated_ready_minutes || defaultEstimateMinutes)
    )
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
