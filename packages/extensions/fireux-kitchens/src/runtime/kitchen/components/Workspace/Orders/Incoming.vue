<template>
  <UAlert
    v-if="printWarnings.length"
    color="warning"
    variant="soft"
    title="Accepted orders need printing"
    :description="`Use Print on ticket ${printWarnings.join(', ')}. Allow print windows if your browser blocked them. Order acceptance succeeded.`"
  />
  <UButton
    v-if="incomingOrders.length"
    color="warning"
    variant="soft"
    icon="i-lucide-inbox"
    :label="`Incoming ${incomingOrders.length}`"
    @click="incomingOpen = true"
  />

  <WorkspaceKitchenOrdersWorkspaceModal
    v-model:open="incomingOpen"
    title="Orders to accept"
    :description="incomingDescription"
  >
    <WorkspaceKitchenOrdersReceivingDesk
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
  </WorkspaceKitchenOrdersWorkspaceModal>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import { useUserSession } from 'fireux-core/runtime/user/composables/useUserSession'
import type { KitchenOrder } from '../../../utils/order.ts'
import {
  openKitchenOrderPrintWindow,
  printKitchenOrderTicket,
} from '../../../composables/orders/useKitchenOrderReceiptPrint'
import { useKitchenOrdersContext } from '../../../composables/workspace/orders/useKitchenOrdersContext'

defineOptions({ name: 'WorkspaceKitchenOrdersIncoming' })

const defaultEstimateMinutes = 45
const incomingOpen = ref(false)
const acceptingOrderId = ref('')
const rejectingOrderId = ref('')
const printWarnings = ref<string[]>([])
const currentTimeMs = ref(Date.now())
const estimatesByOrderId = ref<Record<string, number>>({})
let minuteClock: number | undefined
const {
  captureIntent,
  kitchenId,
  incomingOrders,
  canOperate,
  canInteract,
  normalizeId,
  acceptOrder,
  rejectOrder,
} = useKitchenOrdersContext()
const { currentUser } = useAuth()
const config = useFireUXConfig()
const { appUser } = useUserSession()
watch([kitchenId, () => currentUser.value?.uid, () => config.appId, () => JSON.stringify(appUser.value)], () => {
  acceptingOrderId.value = ''; rejectingOrderId.value = ''; printWarnings.value = []
  estimatesByOrderId.value = {}; incomingOpen.value = false
}, { flush: 'sync' })
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

type IncomingAcceptance = { id: string; estimatedMinutes: number | null }

async function acceptIncomingOrder(
  payload: IncomingAcceptance,
  reserved?: Window | null
) {
  const orderId = normalizeId(payload.id)
  const order = incomingOrders.value.find(
    (candidate) => candidate.id === orderId
  )
  if (
    !canOperate.value ||
    !order ||
    !canInteract(order) ||
    acceptingOrderId.value
  ) {
    reserved?.close()
    return
  }
  const waitsForPayment = order.payment?.flow === 'confirmation_first'
  const printWindow = waitsForPayment
    ? null
    : reserved === undefined
      ? openKitchenOrderPrintWindow()
      : reserved
  if (waitsForPayment) reserved?.close()
  const isCurrent = captureIntent()
  acceptingOrderId.value = orderId
  try {
    await acceptOrder(orderId, payload.estimatedMinutes)
  } catch {
    printWindow?.close()
    // The transition mutation owns the operator-facing error state.
    return
  } finally {
    if (isCurrent() && acceptingOrderId.value === orderId) acceptingOrderId.value = ''
  }
  if (!isCurrent()) { printWindow?.close(); return }
  if (waitsForPayment) return
  try {
    if (printKitchenOrderTicket(order, printWindow)) return
  } catch {
    printWindow?.close()
  }
  const label = String(order.service_number || order.order_number || order.id)
  if (!printWarnings.value.includes(label)) printWarnings.value.push(label)
}

async function acceptIncomingOrders(payloads: IncomingAcceptance[]) {
  if (!canOperate.value || acceptingOrderId.value) return
  // Reserve synchronously; browsers may permit only the first popup.
  const seen = new Set<string>()
  const requests = payloads
    .filter((payload) => {
      const id = normalizeId(payload.id)
      const order = incomingOrders.value.find(
        (candidate) => candidate.id === id
      )
      if (!order || !canInteract(order) || seen.has(id)) return false
      seen.add(id)
      return true
    })
    .map((payload) => {
      const order = incomingOrders.value.find(
        (candidate) => candidate.id === normalizeId(payload.id)
      )
      const waitsForPayment = order?.payment?.flow === 'confirmation_first'
      return {
        payload,
        target: waitsForPayment ? null : openKitchenOrderPrintWindow(),
      }
    })
  const isCurrent = captureIntent()
  for (const request of requests) {
    if (!isCurrent()) { request.target?.close(); continue }
    await acceptIncomingOrder(request.payload, request.target)
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

  const isCurrent = captureIntent()
  rejectingOrderId.value = orderId
  try {
    await rejectOrder(orderId, note)
  } catch {
    // The transition mutation owns the operator-facing error state.
  } finally {
    if (isCurrent() && rejectingOrderId.value === orderId) rejectingOrderId.value = ''
  }
}

function estimateMinutes(order: KitchenOrder) {
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
