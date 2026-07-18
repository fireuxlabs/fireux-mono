<template>
  <UCard
    class="receiving-order"
    :ui="{
      body: reviewOpen
        ? 'receiving-order__body'
        : 'receiving-order__body--closed',
    }"
  >
    <template #header>
      <ConsoleKitchenOperationsOrdersReceivingSummary
        :icon="incomingIcon"
        :title="incomingTitle"
        :order-label="orderNumber"
        :item-count="lines.length"
        :open="reviewOpen"
        :accept-label="quickAcceptLabel"
        :accept-icon="quickAcceptIcon"
        :accepting="accepting"
        :can-accept="canQuickAccept"
        @accept="quickAccept"
        @toggle="reviewOpen = !reviewOpen"
      />
    </template>

    <div v-if="reviewOpen" class="receiving-order__review">
      <ConsoleKitchenOperationsOrdersReceivingItems :lines="lines" />

      <template v-if="isTerminal">
        <UBadge color="neutral" variant="soft">{{ terminalLabel }}</UBadge>
        <p v-if="terminalNote" class="receiving-order__note">
          {{ terminalNote }}
        </p>
      </template>

      <div v-else-if="isPaymentPending" class="receiving-order__status">
        <UBadge color="warning" variant="soft">Payment pending</UBadge>
        <strong v-if="isCollectionOrder">{{ collectionTimingTimeLabel }}</strong>
      </div>

      <ConsoleKitchenOperationsOrdersReceivingCollection
        v-else-if="isCollectionOrder"
        :accepting="accepting"
        :can-interact="canInteract"
        :estimate-minutes="estimateMinutes"
        :order="order"
        :order-id="orderId"
        @accept="$emit('accept', $event)"
        @nudge-estimate="$emit('nudge-estimate', $event)"
        @set-estimate="$emit('set-estimate', $event)"
      />

      <ConsoleKitchenOperationsOrdersReceivingPreOrder
        v-else-if="isPreOrder"
        :accepting="accepting"
        :can-interact="canInteract"
        :order="order"
        :order-id="orderId"
        @accept="$emit('accept', $event)"
      />

      <ConsoleKitchenOperationsOrdersReceivingEstimate
        v-else
        :accepting="accepting"
        :can-interact="canInteract"
        :minutes="estimateMinutes"
        :order-id="orderId"
        @accept="$emit('accept', $event)"
        @nudge-estimate="$emit('nudge-estimate', $event)"
        @set-estimate="$emit('set-estimate', $event)"
      />

      <ConsoleKitchenOperationsOrdersReceivingReject
        v-if="!isPaymentPending && !isTerminal"
        :order-id="orderId"
        :rejecting="rejecting"
        :can-interact="canInteract"
        @reject="$emit('reject', $event)"
      />
    </div>
  </UCard>
</template>

<script setup lang="ts">
import {
  computed,
  ref,
} from 'vue'
import type { KitchenOrder } from '../../../../../../models/kitchen/order.model'
import { kitchenOrderOperatorLabel } from '../../../../../../utils/kitchen-order-label'

const props = withDefaults(
  defineProps<{
    accepting?: boolean
    canInteract?: boolean
    estimateMinutes: number
    nowMs: number
    order: KitchenOrder
    rejecting?: boolean
  }>(),
  {
    accepting: false,
    canInteract: true,
    rejecting: false,
  }
)
const emit = defineEmits<{
  (event: 'accept', payload: { id: string; estimatedMinutes: number | null }): void
  (event: 'nudge-estimate', payload: { id: string; amount: number }): void
  (event: 'reject', payload: { id: string; note: string }): void
  (event: 'set-estimate', payload: { id: string; minutes: number }): void
}>()

const reviewOpen = ref(false)
const normalize = (value: unknown) => String(value ?? '').trim()
const record = (value: unknown): Record<string, unknown> =>
  value && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {}
const timestampMs = (value: unknown) => {
  if (value instanceof Date) return value.getTime()
  if (typeof value === 'number') return value > 1_000_000_000_000 ? value : value * 1000

  const source = value as { seconds?: number; toMillis?: () => number } | null
  if (typeof source?.toMillis === 'function') return source.toMillis()

  const seconds = Number(source?.seconds)
  if (Number.isFinite(seconds) && seconds > 0) return seconds * 1000

  const parsed = Date.parse(normalize(value))
  return Number.isFinite(parsed) ? parsed : 0
}
const formatTime = (value: number) =>
  new Intl.DateTimeFormat('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(new Date(value))
const orderRecord = computed(() => props.order as Record<string, unknown>)
const orderId = computed(() => normalize(props.order.id))
const orderNumber = computed(() => {
  return kitchenOrderOperatorLabel(orderRecord.value)
})
const orderType = computed(() => normalize(props.order.order_type))
const orderStatus = computed(() => normalize(props.order.status))
const collection = computed(() => record(orderRecord.value.collection))
const roomService = computed(() => record(orderRecord.value.room_service))
const isTerminal = computed(() =>
  ['cancelled', 'completed'].includes(orderStatus.value)
)
const isPaymentPending = computed(() => orderStatus.value === 'pending_payment')
const isCollectionOrder = computed(() => orderType.value === 'collection')
const isDeliveryOrder = computed(() => orderType.value === 'delivery')
const isPreOrder = computed(() => orderType.value === 'pre_order')
const isRoomService = computed(() => orderType.value === 'room_service')
const requestedFor = computed(() =>
  collection.value.requested_for || orderRecord.value.requested_for
)
const requestedForMs = computed(() => timestampMs(requestedFor.value))
const isScheduledCollection = computed(() =>
  isCollectionOrder.value &&
    normalize(collection.value.mode) === 'scheduled' &&
    Boolean(requestedForMs.value)
)
const incomingIcon = computed(() => {
  if (isDeliveryOrder.value) return 'i-lucide-bike'
  if (isCollectionOrder.value) return 'i-lucide-shopping-bag'
  if (isPreOrder.value) return 'i-lucide-calendar-clock'
  if (isRoomService.value) return 'i-lucide-concierge-bell'
  return ''
})
const incomingTitle = computed(() => {
  if (isTerminal.value) return 'Kitchen response'
  if (isPaymentPending.value) return 'Payment pending'
  if (isPreOrder.value) return 'Pre-order'
  if (isRoomService.value) {
    const room = normalize(roomService.value.room)
    return room ? `Room service · ${room}` : 'Room service'
  }
  if (isScheduledCollection.value) return 'Scheduled collection'
  if (isCollectionOrder.value) return 'Collection'
  if (isDeliveryOrder.value) return 'Delivery'
  return 'Order'
})
const acceptedTimingLabel = computed(() => {
  if (isScheduledCollection.value) return 'accepted'

  const minutes = Math.max(0, Math.round(Number(props.estimateMinutes || 0)))
  if (minutes > 0) return `${minutes} min`

  return 'accepted'
})
const etaMs = computed(() =>
  timestampMs(orderRecord.value.estimated_ready_at) ||
    (
      Number(props.estimateMinutes || 0) > 0
        ? Date.now() + Number(props.estimateMinutes || 0) * 60_000
        : 0
    )
)
const collectionTimingTimeLabel = computed(() => {
  const time = isScheduledCollection.value ? requestedForMs.value : etaMs.value
  if (time) return formatTime(time)

  return isScheduledCollection.value ? 'time needed' : acceptedTimingLabel.value
})
const scheduledCollectionLabel = computed(() => {
  if (!isScheduledCollection.value || !requestedForMs.value) return ''

  const requestedDate = new Date(requestedForMs.value)
  const dayDifference = Math.round(
    (startOfDay(requestedDate).getTime() -
      startOfDay(new Date(props.nowMs)).getTime()) /
      86_400_000
  )
  const time = formatTime(requestedForMs.value)
  const relativeTime = scheduleDistanceLabel(
    requestedForMs.value - props.nowMs,
    dayDifference === 0
  )

  if (dayDifference === 0) return `Today ${time} · ${relativeTime}`
  if (dayDifference === 1) return `Tomorrow ${time} · ${relativeTime}`

  const date = new Intl.DateTimeFormat('en-GB', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
  }).format(requestedDate)

  return `${date} ${time} · ${relativeTime}`
})
const quickAcceptLabel = computed(() => {
  if (!isCollectionOrder.value || isPaymentPending.value || isTerminal.value) {
    return ''
  }
  if (isScheduledCollection.value) {
    return `Accept · ${scheduledCollectionLabel.value.replace(' · ', ' | ')}`
  }

  return `Accept · ${Math.max(0, Math.round(props.estimateMinutes))} min`
})
const quickAcceptIcon = computed(() =>
  isScheduledCollection.value
    ? 'i-lucide-calendar-clock'
    : 'i-lucide-clock-3'
)
const canQuickAccept = computed(() =>
  Boolean(
    props.canInteract &&
      orderId.value &&
      quickAcceptLabel.value &&
      (!isScheduledCollection.value || requestedForMs.value)
  )
)
const terminalLabel = computed(() =>
  orderStatus.value === 'cancelled'
    ? 'Order rejected.'
    : 'Order completed.'
)
const terminalNote = computed(() =>
  normalize(orderRecord.value.kitchen_note)
)
const lines = computed(() =>
  Array.isArray(props.order.items)
    ? props.order.items.map((item, index) => ({
        id: normalize(item.id) || `line-${index + 1}`,
        label: normalize(item.label) || 'Item',
        quantity: Math.max(1, Number(item.quantity || 1) || 1),
      }))
    : []
)

function startOfDay(value: Date) {
  return new Date(value.getFullYear(), value.getMonth(), value.getDate())
}

function scheduleDistanceLabel(distanceMs: number, today: boolean) {
  const minutes = Math.round(distanceMs / 60_000)
  if (!minutes) return 'now'
  if (minutes < 0) return `${Math.abs(minutes)} min late`
  if (today) return `in ${minutes} min`

  const hours = Math.round(minutes / 60)
  if (hours < 48) return `in ${hours} hr`

  return `in ${Math.round(hours / 24)} days`
}

function quickAccept() {
  if (!canQuickAccept.value) return

  emit('accept', {
    id: orderId.value,
    estimatedMinutes: isScheduledCollection.value
      ? null
      : props.estimateMinutes,
  })
}
</script>

<style scoped>
:deep(.receiving-order__body--closed) {
  display: none;
}

.receiving-order__review {
  display: grid;
  gap: calc(var(--spacing) * 3);
}

.receiving-order__status {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: calc(var(--spacing) * 3);
}

.receiving-order__note {
  margin: 0;
}
</style>
