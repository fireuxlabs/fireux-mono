<template>
  <!-- Concurrent edit — 2026-07-20 15:11 CEST — Pre-order workspace route: project canonical incoming pre-orders and existing transitions. -->
  <section class="pre-orders">
    <UAlert
      v-if="transitionError"
      color="error"
      variant="soft"
      icon="i-lucide-triangle-alert"
      title="The pre-order could not be updated"
      :description="transitionError"
    />

    <MoleculesStateCard
      v-if="outcome === 'error'"
      state="error"
      title="Pre-orders unavailable"
      description="Orders could not be loaded. Please try again."
    />
    <UCard v-else-if="pending">
      <div class="pre-orders__pending">
        <UIcon name="i-lucide-loader-circle" class="pre-orders__spinner" />
        <span>Loading incoming pre-orders…</span>
      </div>
    </UCard>

    <UAlert
      v-else-if="!storageKitchenId"
      title="Select an available Kitchen"
      color="neutral"
    />
    <UAlert
      v-else-if="!preOrders.length"
      color="neutral"
      variant="soft"
      icon="i-lucide-calendar-check"
      title="No pre-orders waiting"
      description="New pre-orders will appear here until an operator confirms them or sends them back to the customer."
    />

    <template v-else>
      <header class="pre-orders__header">
        <div>
          <h2 class="pre-orders__title">Awaiting confirmation</h2>
          <p class="pre-orders__description">
            Confirm the requested time or send the order back with a note.
          </p>
        </div>

        <UBadge color="warning" variant="soft" size="lg">
          {{ waitingLabel }}
        </UBadge>
      </header>

      <div class="pre-orders__list">
        <WorkspaceKitchenOrdersReceiving
          v-for="order in preOrders"
          :key="order.id"
          :accepting="acceptingOrderId === normalizeId(order.id)"
          :can-interact="canInteract(order)"
          :estimate-minutes="0"
          :now-ms="currentTimeMs"
          :order="order"
          :rejecting="rejectingOrderId === normalizeId(order.id)"
          @accept="confirmPreOrder"
          @reject="sendBackPreOrder"
        />
      </div>
    </template>
  </section>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import { useUserSession } from 'fireux-core/runtime/user/composables/session/useUserSession'
import { useKitchenAccess } from '../../../composables/useKitchenAccess'
import { useKitchenOrdersContext } from '../../../composables/workspace/orders/useKitchenOrdersContext'
import type { KitchenOrder } from '../../../utils/order.ts'

defineOptions({ name: 'WorkspaceKitchenOrdersPreOrders' })

const acceptingOrderId = ref('')
const rejectingOrderId = ref('')
const currentTimeMs = ref(Date.now())
let minuteClock: number | undefined

const {
  acceptOrder,
  captureIntent,
  kitchenId,
  storageKitchenId,
  outcome,
  canOperate,
  incomingOrders,
  isOrderTransitioning,
  pending,
  rejectOrder,
  transitionError,
} = useKitchenOrdersContext()

const { currentUser } = useAuth()
const config = useFireUXConfig()
const { appUser } = useUserSession()
const access = useKitchenAccess()
watch(
  [
    kitchenId,
    () => currentUser.value?.uid,
    () => config.appId,
    () => JSON.stringify(appUser.value),
    () => JSON.stringify(access.ids.value),
    () => access.outcome.value,
  ],
  () => {
    acceptingOrderId.value = ''
    rejectingOrderId.value = ''
  },
  { flush: 'sync' }
)
const preOrders = computed(() =>
  incomingOrders.value.filter((order) => order.order_type === 'pre_order')
)
const waitingLabel = computed(() =>
  preOrders.value.length === 1
    ? '1 waiting'
    : `${preOrders.value.length} waiting`
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

function normalizeId(value: unknown) {
  return String(value ?? '').trim()
}

function canInteract(order: KitchenOrder) {
  const orderId = normalizeId(order.id)
  return Boolean(
    canOperate.value &&
      orderId &&
      !acceptingOrderId.value &&
      !rejectingOrderId.value &&
      !isOrderTransitioning(orderId)
  )
}

async function confirmPreOrder(payload: {
  id: string
  estimatedMinutes: number | null
}) {
  const orderId = normalizeId(payload.id)
  if (!canOperate.value || !orderId || acceptingOrderId.value) return

  const isCurrent = captureIntent()
  acceptingOrderId.value = orderId
  try {
    await acceptOrder(orderId, null)
  } catch {
    // The canonical transition composable exposes the operator-facing error.
  } finally {
    if (isCurrent() && acceptingOrderId.value === orderId)
      acceptingOrderId.value = ''
  }
}

async function sendBackPreOrder(payload: { id: string; note: string }) {
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
    // The canonical transition composable exposes the operator-facing error.
  } finally {
    if (isCurrent() && rejectingOrderId.value === orderId)
      rejectingOrderId.value = ''
  }
}
</script>

<style scoped>
.pre-orders,
.pre-orders__list {
  display: grid;
  gap: calc(var(--spacing) * 4);
}

.pre-orders__header,
.pre-orders__pending {
  align-items: center;
  display: flex;
}

.pre-orders__header {
  justify-content: space-between;
}

.pre-orders__pending {
  gap: calc(var(--spacing) * 2);
}

.pre-orders__spinner {
  animation: pre-orders-spin 1s linear infinite;
}

.pre-orders__title,
.pre-orders__description {
  margin: 0;
}

.pre-orders__title {
  font-size: var(--text-xl);
  font-weight: var(--font-weight-semibold);
}

.pre-orders__description {
  color: var(--ui-text-muted);
  margin-top: var(--spacing);
}

@keyframes pre-orders-spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
