<template>
  <WorkspaceKitchenOperationsOrdersReceivingScheduled
    v-if="isScheduledMode"
    label="Requested pickup"
    :date-time-label="requestedDateTimeLabel"
    :detail="requestedDistanceLabel"
    accept-label="Accept pickup time"
    waiting-label="Waiting for pickup time"
    :can-accept="canAcceptRequested"
    :accepting="accepting"
    @accept="acceptRequested"
  />

  <WorkspaceKitchenOperationsOrdersReceivingEstimate
    v-else
    :accepting="accepting"
    :can-interact="canInteract"
    :minutes="estimateMinutes"
    :order-id="orderId"
    @accept="$emit('accept', $event)"
    @nudge-estimate="$emit('nudge-estimate', $event)"
    @set-estimate="$emit('set-estimate', $event)"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { KitchenOrder } from '../../../../../utils/order.ts'
import {
  formatKitchenOrderRequestedTime,
  kitchenOrderTimestampMs,
} from '../../../../../utils/kitchen-order-time'

const props = withDefaults(
  defineProps<{
    accepting?: boolean
    canInteract?: boolean
    estimateMinutes: number
    order: KitchenOrder
    orderId: string
  }>(),
  {
    accepting: false,
    canInteract: true,
  }
)
const emit = defineEmits<{
  (
    event: 'accept',
    payload: { id: string; estimatedMinutes: number | null }
  ): void
  (event: 'nudge-estimate', payload: { id: string; amount: number }): void
  (event: 'set-estimate', payload: { id: string; minutes: number }): void
}>()

const normalize = (value: unknown) => String(value ?? '').trim()
const record = (value: unknown): Record<string, unknown> =>
  value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {}
const collection = computed(() =>
  record((props.order as Record<string, unknown>).collection)
)
const isScheduledMode = computed(
  () => normalize(collection.value.mode) === 'scheduled'
)
const requestedFor = computed(() => collection.value.requested_for)
const requestedTime = computed(() =>
  formatKitchenOrderRequestedTime(requestedFor.value)
)
const requestedDateTimeLabel = computed(() => requestedTime.value.dateTime)
const requestedDistanceLabel = computed(() => requestedTime.value.distance)
const canAcceptRequested = computed(
  () =>
    props.canInteract &&
    Boolean(props.orderId && kitchenOrderTimestampMs(requestedFor.value))
)

function acceptRequested() {
  if (!canAcceptRequested.value) return
  emit('accept', {
    id: props.orderId,
    estimatedMinutes: null,
  })
}
</script>
