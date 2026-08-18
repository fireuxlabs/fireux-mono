<template>
  <ConsoleKitchenOperationsOrdersReceivingScheduled
    label="Requested time"
    :date-time-label="requestedDateTimeLabel"
    :detail="requestedDetail"
    accept-label="Accept pre-order time"
    :can-accept="canAcceptRequested"
    :accepting="accepting"
    @accept="acceptRequested"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { KitchenOrder } from '../../../../../models/order.model.ts'
import {
  formatKitchenOrderRequestedTime,
  kitchenOrderTimestampMs,
} from '../../../../../utils/kitchen-order-time'

const props = withDefaults(
  defineProps<{
    accepting?: boolean
    canInteract?: boolean
    order: KitchenOrder
    orderId: string
  }>(),
  {
    accepting: false,
    canInteract: true,
  }
)
const emit = defineEmits<{
  (event: 'accept', payload: { id: string; estimatedMinutes: number | null }): void
}>()

const record = (value: unknown): Record<string, unknown> =>
  value && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {}
const orderRecord = computed(() => props.order as Record<string, unknown>)
const customer = computed(() => record(orderRecord.value.customer))
const requestedFor = computed(() => orderRecord.value.requested_for)
const partySize = computed(() =>
  Math.max(0, Math.floor(Number(customer.value.party_size || 0)))
)
const requestedTime = computed(() =>
  formatKitchenOrderRequestedTime(requestedFor.value)
)
const requestedDateTimeLabel = computed(() => requestedTime.value.dateTime)
const requestedDetail = computed(() => [
  requestedTime.value.distance,
  partySize.value ? `${partySize.value} guests` : '',
].filter(Boolean).join(' · '))
const canAcceptRequested = computed(() =>
  props.canInteract && Boolean(
    props.orderId && kitchenOrderTimestampMs(requestedFor.value)
  )
)

function acceptRequested() {
  if (!canAcceptRequested.value) return
  emit('accept', {
    id: props.orderId,
    estimatedMinutes: null,
  })
}
</script>
