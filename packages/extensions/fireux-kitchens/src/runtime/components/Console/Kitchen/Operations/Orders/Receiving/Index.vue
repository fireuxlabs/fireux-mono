<template>
  <article class="grid max-w-[22rem] gap-4 rounded-lg border border-primary/20 bg-default p-4 shadow-sm">
    <header class="flex items-start justify-between gap-3">
      <div class="flex min-w-0 items-start gap-3">
        <UIcon
          v-if="incomingIcon"
          :name="incomingIcon"
          class="mt-0.5 size-5 shrink-0 text-primary"
          aria-hidden="true"
        />

        <div class="min-w-0">
          <p class="m-0 text-xs font-extrabold uppercase text-muted">
            Incoming
          </p>
          <h3 class="m-0 text-base font-black text-highlighted">
            {{ incomingTitle }}
          </h3>
        </div>
      </div>

      <UButton
        size="xs"
        color="neutral"
        variant="soft"
        :icon="copied ? 'i-lucide-check' : 'i-lucide-copy'"
        @click="copyTicket"
      >
        {{ copied ? 'Copied' : 'Copy' }}
      </UButton>
    </header>

    <div class="grid gap-1 text-sm font-semibold text-highlighted">
      <p
        v-for="line in lines"
        :key="line.id"
        class="m-0"
      >
        {{ line.quantity }}x {{ line.label }}
      </p>
    </div>

    <p
      v-if="isTerminal"
      class="m-0 text-sm font-semibold text-muted"
    >
      {{ terminalLabel }}
    </p>

    <p
      v-if="isTerminal && terminalNote"
      class="m-0 rounded-lg border border-default bg-muted/40 p-3 text-sm font-semibold text-highlighted"
    >
      {{ terminalNote }}
    </p>

    <section
      v-else-if="isPaymentPending && isCollectionOrder"
      class="grid gap-2 rounded-lg border border-default bg-muted/40 p-3"
    >
      <div class="flex items-center justify-between gap-3 text-sm">
        <span class="font-semibold text-muted">
          {{ collectionTimingLabel }}
        </span>
        <strong class="text-base font-black text-highlighted">
          {{ collectionTimingTimeLabel }}
        </strong>
      </div>

      <div class="flex items-center justify-between gap-3 text-sm">
        <span class="font-semibold text-muted">
          {{ acceptedTimingKindLabel }}
        </span>
        <strong class="text-base font-black text-highlighted">
          {{ acceptedTimingLabel }}
        </strong>
      </div>

      <p class="m-0 text-sm font-semibold text-muted">
        Moves to a normal ticket once paid.
      </p>
    </section>

    <section
      v-else-if="isPaymentPending"
      class="grid gap-2 rounded-lg border border-default bg-muted/40 p-3"
    >
      <div class="flex items-center justify-between gap-3 text-sm">
        <span class="font-semibold text-muted">
          Payment
        </span>
        <strong class="text-base font-black text-highlighted">
          pending
        </strong>
      </div>

      <p class="m-0 text-sm font-semibold text-muted">
        Kitchen receives this order after payment.
      </p>
    </section>

    <ConsoleKitchenOperationsOrdersReceivingCollection
      v-else-if="isCollectionOrder"
      :accepting="accepting"
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
      :order="order"
      :order-id="orderId"
      @accept="$emit('accept', $event)"
    />

    <ConsoleKitchenOperationsOrdersReceivingEstimate
      v-else
      :accepting="accepting"
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
      @reject="$emit('reject', $event)"
    />
  </article>
</template>

<script setup lang="ts">
import {
  computed,
  ref,
} from 'vue'
import type { KitchenOrder } from '../../../../../../models/kitchen/order.model'

const props = withDefaults(
  defineProps<{
    accepting?: boolean
    estimateMinutes: number
    order: KitchenOrder
    rejecting?: boolean
  }>(),
  {
    accepting: false,
    rejecting: false,
  }
)
defineEmits<{
  (event: 'accept', payload: { id: string; estimatedMinutes: number | null }): void
  (event: 'nudge-estimate', payload: { id: string; amount: number }): void
  (event: 'reject', payload: { id: string; note: string }): void
  (event: 'set-estimate', payload: { id: string; minutes: number }): void
}>()

const copied = ref(false)
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
const orderType = computed(() => normalize(props.order.order_type))
const orderStatus = computed(() => normalize(props.order.status))
const collection = computed(() => record(orderRecord.value.collection))
const roomService = computed(() => record(orderRecord.value.room_service))
const isTerminal = computed(() =>
  ['cancelled', 'canceled', 'closed', 'rejected'].includes(orderStatus.value)
)
const isPaymentPending = computed(() => orderStatus.value === 'pending_payment')
const isCollectionOrder = computed(() => orderType.value === 'collection')
const isDeliveryOrder = computed(() => orderType.value === 'delivery')
const isPreOrder = computed(() => orderType.value === 'pre_order')
const isRoomService = computed(() => orderType.value === 'room_service')
const requestedFor = computed(() => normalize(collection.value.requested_for))
const isScheduledCollection = computed(() =>
  isCollectionOrder.value &&
    normalize(collection.value.mode) === 'scheduled' &&
    Boolean(requestedFor.value)
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
  if (isPaymentPending.value && isCollectionOrder.value) return 'Collection timing request'
  if (isPaymentPending.value && isPreOrder.value) return 'Pre-order deposit'
  if (isPaymentPending.value) return 'Awaiting customer payment'
  if (isPreOrder.value) return 'Pre-order request'
  if (isRoomService.value) {
    const room = normalize(roomService.value.room)
    return room ? `Room service · ${room}` : 'Room service request'
  }
  if (isScheduledCollection.value) return 'Confirm collection time'
  if (isCollectionOrder.value) return 'Collection timing request'
  return 'Set cooking time'
})
const acceptedTimingLabel = computed(() => {
  if (isScheduledCollection.value) return 'accepted'

  const minutes = Math.max(0, Math.round(Number(props.estimateMinutes || 0)))
  if (minutes > 0) return `${minutes} min`

  return 'accepted'
})
const acceptedTimingKindLabel = computed(() =>
  isScheduledCollection.value ? 'Pickup time' : 'Cooking time'
)
const etaMs = computed(() =>
  timestampMs(orderRecord.value.estimated_ready_at) ||
    (
      Number(props.estimateMinutes || 0) > 0
        ? Date.now() + Number(props.estimateMinutes || 0) * 60_000
        : 0
    )
)
const requestedForMs = computed(() => timestampMs(requestedFor.value))
const collectionTimingLabel = computed(() =>
  isScheduledCollection.value ? 'Scheduled pickup' : 'Queue ETA'
)
const collectionTimingTimeLabel = computed(() => {
  const time = isScheduledCollection.value ? requestedForMs.value : etaMs.value
  if (time) return formatTime(time)

  return isScheduledCollection.value ? 'time needed' : acceptedTimingLabel.value
})
const terminalLabel = computed(() =>
  ['cancelled', 'canceled', 'rejected'].includes(orderStatus.value)
    ? 'Order rejected.'
    : 'Order closed.'
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
const copyPayload = computed(() => {
  const response = isScheduledCollection.value
    ? { collection_timing: 'scheduled', accepted_requested_for: requestedFor.value }
    : isPaymentPending.value
      ? {
          collection_timing: 'queue',
          estimated_ready_minutes: props.estimateMinutes,
          estimated_ready_at: etaMs.value ? new Date(etaMs.value).toISOString() : '',
        }
      : {
          collection_timing: isCollectionOrder.value ? 'queue' : '',
          estimated_ready_minutes: props.estimateMinutes,
          estimated_ready_at: etaMs.value ? new Date(etaMs.value).toISOString() : '',
        }

  return {
    surface: 'kitchen_console_orders_receiving',
    action: incomingTitle.value,
    copied_at: new Date().toISOString(),
    order: {
      id: orderId.value,
      number: normalize(props.order.order_number),
      type: orderType.value,
      status: orderStatus.value,
      collection: Object.keys(collection.value).length ? collection.value : null,
      items: lines.value.map((line) => ({
        quantity: line.quantity,
        label: line.label,
      })),
    },
    ...(Object.keys(response).length ? { response } : {}),
  }
})

async function copyTicket() {
  if (!import.meta.client || !navigator.clipboard) return

  await navigator.clipboard.writeText(JSON.stringify(copyPayload.value, null, 2))
  copied.value = true
  window.setTimeout(() => {
    copied.value = false
  }, 1400)
}
</script>
