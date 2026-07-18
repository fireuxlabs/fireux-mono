<template>
  <UCard
    class="receiving-order"
  >
    <template #header>
      <ConsoleKitchenOperationsOrdersReceivingSummary
        :icon="incomingIcon"
        :title="incomingTitle"
        :order-label="orderNumber"
        :item-count="lines.length"
        :timing-label="timingLabel"
      />
    </template>

    <div class="receiving-order__review">
      <section class="receiving-order__items">
        <h3 class="receiving-order__heading">Order items</h3>
        <ConsoleKitchenOperationsOrdersReceivingItems :lines="lines" />
      </section>

      <aside class="receiving-order__decision">
        <ConsoleKitchenOperationsOrdersReceivingCollection
          v-if="isCollectionOrder"
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

        <ConsoleKitchenOperationsOrdersReceivingDelivery
          v-else-if="isDeliveryOrder"
          :accepting="accepting"
          :can-interact="canInteract"
          :estimate-minutes="estimateMinutes"
          :order-id="orderId"
          @accept="$emit('accept', $event)"
          @nudge-estimate="$emit('nudge-estimate', $event)"
          @set-estimate="$emit('set-estimate', $event)"
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
          :order-id="orderId"
          :rejecting="rejecting"
          :can-interact="canInteract"
          @reject="$emit('reject', $event)"
        />
      </aside>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { computed } from 'vue'
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
defineEmits<{
  (event: 'accept', payload: { id: string; estimatedMinutes: number | null }): void
  (event: 'nudge-estimate', payload: { id: string; amount: number }): void
  (event: 'reject', payload: { id: string; note: string }): void
  (event: 'set-estimate', payload: { id: string; minutes: number }): void
}>()

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
const collection = computed(() => record(orderRecord.value.collection))
const isCollectionOrder = computed(() => orderType.value === 'collection')
const isDeliveryOrder = computed(() => orderType.value === 'delivery')
const isPreOrder = computed(() => orderType.value === 'pre_order')
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
  return 'i-lucide-inbox'
})
const incomingTitle = computed(() => {
  if (isPreOrder.value) return 'Pre-order'
  if (isScheduledCollection.value) return 'Scheduled collection'
  if (isCollectionOrder.value) return 'Collection'
  if (isDeliveryOrder.value) return 'Delivery'
  return 'Order'
})
const scheduledOrderLabel = computed(() => {
  if (!(isScheduledCollection.value || isPreOrder.value) || !requestedForMs.value) {
    return ''
  }

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
const timingLabel = computed(() => {
  if (isScheduledCollection.value || isPreOrder.value) {
    if (!requestedForMs.value) return ''
    return scheduledOrderLabel.value
  }

  if (!isCollectionOrder.value && !isDeliveryOrder.value) return ''

  return `${Math.max(0, Math.round(props.estimateMinutes))} min`
})
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

</script>

<style scoped>
.receiving-order__review {
  display: grid;
  gap: calc(var(--spacing) * 5);
  grid-template-columns: minmax(0, 1fr) minmax(16rem, 0.7fr);
}

.receiving-order__items,
.receiving-order__decision {
  min-width: 0;
}

.receiving-order__decision {
  border-left: 1px solid var(--ui-border-accented);
  padding-left: calc(var(--spacing) * 5);
}

.receiving-order__heading {
  color: var(--ui-text-muted);
  font-size: var(--text-xs);
  font-weight: var(--font-weight-bold);
  letter-spacing: 0.04em;
  margin: 0 0 calc(var(--spacing) * 3);
  text-transform: uppercase;
}

@media (max-width: 64rem) {
  .receiving-order__review {
    grid-template-columns: minmax(0, 1fr);
  }

  .receiving-order__decision {
    border-left: 0;
    border-top: 1px solid var(--ui-border-accented);
    padding-left: 0;
    padding-top: calc(var(--spacing) * 4);
  }
}
</style>
