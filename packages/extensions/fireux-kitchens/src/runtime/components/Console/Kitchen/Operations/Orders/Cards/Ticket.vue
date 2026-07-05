<template>
  <div
    class="w-[18rem] max-w-full shrink-0 self-start overflow-hidden rounded-lg border border-default bg-default shadow-sm"
  >
    <div class="divide-y divide-default">
      <div
        :class="[
          'flex h-12 shrink-0 items-center justify-between gap-3 px-4 text-sm font-semibold text-highlighted',
          canTouchHeader && 'cursor-pointer hover:bg-muted/40',
        ]"
        :role="canTouchHeader ? 'button' : undefined"
        :tabindex="canTouchHeader ? 0 : undefined"
        :aria-label="headerActionLabel || undefined"
        @click="touchHeader"
        @keydown.enter.prevent="touchHeader"
        @keydown.space.prevent="touchHeader"
      >
        <span class="flex min-w-0 items-center gap-2">
          <UIcon :name="headerIcon" class="size-4 shrink-0" />
          <span class="truncate">{{ headerLabel }}</span>
          <span
            v-if="isWaitingForAcceptance"
            class="order-ticket__waiting-status"
            aria-label="Waiting for kitchen acceptance"
          >
            <span class="order-ticket__spinner" aria-hidden="true" />
            <span>waiting</span>
          </span>
        </span>
        <span class="flex shrink-0 items-center gap-2">
          <button
            v-if="canTouchStatus"
            class="order-ticket__status-action"
            type="button"
            :disabled="statusActionPending"
            :aria-label="statusActionAriaLabel || statusActionLabel"
            @click.stop="touchStatus"
          >
            <span
              v-if="statusActionPending"
              class="order-ticket__spinner"
              aria-hidden="true"
            />
            {{ statusActionLabel }}
          </button>

          <span
            v-else-if="statusLabel"
            class="text-xs font-medium text-dimmed"
          >
            {{ statusLabel }}
          </span>

          <UButton
            v-if="trashMode"
            size="xs"
            color="error"
            variant="ghost"
            icon="i-lucide-trash-2"
            :disabled="!orderId"
            aria-label="Move order to trash"
            @click.stop="trashOrder"
          />
        </span>
      </div>

      <div
        :class="[
          'space-y-1 p-4',
          canTouchBody && 'cursor-pointer hover:bg-muted/40',
        ]"
        :role="canTouchBody ? 'button' : undefined"
        :tabindex="canTouchBody ? 0 : undefined"
        :aria-label="bodyActionLabel || undefined"
        @click="touchBody"
        @keydown.enter.prevent="touchBody"
        @keydown.space.prevent="touchBody"
      >
        <div
          v-for="line in lines"
          :key="line.id"
          class="flex items-start gap-2 text-sm"
        >
          <span class="w-6 shrink-0 font-semibold">{{ line.qty }}x</span>
          <span class="min-w-0">
            {{ line.label }}
            <small
              v-if="line.variant && !line.label.includes(line.variant)"
              class="block text-xs text-dimmed"
            >
              {{ line.variant }}
            </small>
            <small
              v-if="line.addOns.length"
              class="block text-xs text-dimmed"
            >
              + {{ line.addOns.join(', ') }}
            </small>
          </span>
        </div>

        <div v-if="!lines.length" class="text-xs italic text-dimmed">
          No items in this order.
        </div>

        <div
          v-if="customerLines.length"
          class="mt-3 space-y-0.5 border-t border-default pt-3 text-xs text-dimmed"
        >
          <p
            v-for="line in customerLines"
            :key="line"
            class="m-0"
          >
            {{ line }}
          </p>
        </div>
      </div>

      <div class="flex h-12 shrink-0 items-center justify-between gap-2 px-4 text-xs font-medium text-dimmed">
        <span class="min-w-0 truncate">
          {{ orderLabel }}
        </span>

        <button
          type="button"
          class="order-ticket__copy"
          :disabled="!orderId"
          @click.stop="copyTicket"
        >
          <UIcon
            :name="copied ? 'i-lucide-check' : 'i-lucide-copy'"
            aria-hidden="true"
          />
          {{ copied ? 'Copied' : 'Copy' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  computed,
  ref,
} from 'vue'
import type { KitchenOrder } from '../../../../../../models/kitchen/order.model'

const props = withDefaults(
  defineProps<{
    order: KitchenOrder
    trashMode?: boolean
    headerActionLabel?: string
    bodyActionLabel?: string
    statusActionLabel?: string
    statusActionAriaLabel?: string
    statusActionPending?: boolean
  }>(),
  {
    trashMode: false,
    headerActionLabel: '',
    bodyActionLabel: '',
    statusActionLabel: '',
    statusActionAriaLabel: '',
    statusActionPending: false,
  }
)
const emit = defineEmits<{
  (event: 'trash', id: string): void
  (event: 'touch-header', id: string): void
  (event: 'touch-body', id: string): void
  (event: 'touch-status', id: string): void
}>()
const copied = ref(false)

const normalizeString = (value: unknown) => String(value ?? '').trim()
const timestampMs = (value: unknown, baseMs = 0) => {
  if (value instanceof Date) return value.getTime()
  if (typeof value === 'number') return value > 1_000_000_000_000 ? value : value * 1000

  const source = value as { seconds?: number; toMillis?: () => number } | null
  if (typeof source?.toMillis === 'function') return source.toMillis()

  const seconds = Number(source?.seconds)
  if (Number.isFinite(seconds) && seconds > 0) return seconds * 1000

  const text = normalizeString(value)
  const timeOnly = text.match(/^(\d{1,2}):(\d{2})$/)
  if (timeOnly) {
    const date = new Date(baseMs || Date.now())
    date.setHours(Number(timeOnly[1]), Number(timeOnly[2]), 0, 0)
    return date.getTime()
  }

  const parsed = Date.parse(text)
  return Number.isFinite(parsed) ? parsed : 0
}
const formatTime = (value: number) =>
  new Intl.DateTimeFormat('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(new Date(value))

const orderValue = (keys: string[]) => {
  const source = props.order as Record<string, unknown>
  for (const key of keys) {
    const value = source[key]
    if (value !== undefined && value !== null && value !== '') return value
  }
  return null
}
const collectionRequestedFor = () => {
  const collection = (props.order as Record<string, unknown>).collection
  if (!collection || typeof collection !== 'object' || Array.isArray(collection)) {
    return ''
  }

  return normalizeString((collection as Record<string, unknown>).requested_for)
}
const orderRecord = computed(() => props.order as Record<string, unknown>)
const orderStatus = computed(() => normalizeString(props.order.status))
const isWaitingForAcceptance = computed(() =>
  orderStatus.value === 'pending_acceptance'
)
const record = (value: unknown): Record<string, unknown> =>
  value && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {}

const placedMs = computed(
  () =>
    timestampMs((props.order as any).created?.at) ||
    timestampMs((props.order as any).created_at) ||
    timestampMs((props.order as any).updated?.at) ||
    timestampMs((props.order as any).updated_at)
)
const pickupMs = computed(() =>
  timestampMs(
    collectionRequestedFor() ||
      orderValue([
        'requested_for',
        'pickup_at',
        'pickup_time',
        'collection_at',
        'due_at',
      ]),
    placedMs.value
  )
)
const serviceMode = computed(() => {
  const value = normalizeString(
    orderValue([
      'order_type',
      'service_mode',
      'serviceMode',
      'fulfilment_type',
      'fulfillment_type',
      'channel',
    ])
  ).toLowerCase()

  if (
    ['collection', 'collect', 'pickup', 'pick_up'].includes(value) ||
    value.includes('collection') ||
    value.includes('pickup')
  ) {
    return 'collection'
  }
  if (
    ['delivery', 'deliver'].includes(value) ||
    value.includes('delivery')
  ) {
    return 'delivery'
  }
  if (
    ['dine_in', 'dine-in', 'table'].includes(value) ||
    value.includes('dine')
  ) {
    return 'dine_in'
  }
  if (
    ['eat_in', 'eat-in'].includes(value) ||
    value.includes('eat in')
  ) {
    return 'eat_in'
  }
  if (
    ['takeaway', 'take-away'].includes(value) ||
    value.includes('takeaway') ||
    value.includes('take away')
  ) {
    return 'takeaway'
  }
  return value
})
const headerIcon = computed(() =>
  serviceMode.value === 'collection'
    ? 'i-lucide-shopping-bag'
    : serviceMode.value === 'delivery'
      ? 'i-lucide-bike'
      : serviceMode.value === 'dine_in' || serviceMode.value === 'eat_in'
        ? 'i-lucide-utensils'
        : serviceMode.value === 'takeaway'
          ? 'i-lucide-shopping-bag'
        : 'i-lucide-clock'
)
const headerLabel = computed(() => {
  if (serviceMode.value === 'collection') {
    return pickupMs.value
      ? `Pick up ${formatTime(pickupMs.value)}`
      : 'Collection'
  }

  if (serviceMode.value === 'delivery') {
    return pickupMs.value
      ? `Deliver ${formatTime(pickupMs.value)}`
      : 'Delivery'
  }

  if (serviceMode.value === 'dine_in') {
    return 'Dine in'
  }

  if (serviceMode.value === 'eat_in') {
    return 'Eat in'
  }

  if (serviceMode.value === 'takeaway') {
    return 'Takeaway'
  }

  return placedMs.value ? `Placed ${formatTime(placedMs.value)}` : 'Time unset'
})
const statusLabel = computed(() => {
  const status = orderStatus.value
  if (status === 'pending_payment') return 'payment pending'
  if (status === 'pending_acceptance') return 'waiting'

  const estimatedReadyMinutes = Number(
    (props.order as any).estimated_ready_minutes || 0
  )
  if (status === 'open' && estimatedReadyMinutes > 0) {
    return `eta ${estimatedReadyMinutes} min`
  }

  const estimatedReadyMs = timestampMs((props.order as any).estimated_ready_at)
  if (status === 'open' && estimatedReadyMs) {
    return `eta ${formatTime(estimatedReadyMs)}`
  }

  const fireState = normalizeString((props.order as any).fire_state)
  if (fireState === 'held') return 'held'
  if (fireState === 'ready_to_fire') return 'ready'

  if (!status || status === 'open') return ''

  return status.replace(/[_-]+/g, ' ')
})
const orderLabel = computed(() => {
  const number = normalizeString(props.order.order_number)
  return number ? `Order #${number}` : normalizeString(props.order.id) || 'Order'
})
const orderId = computed(() => normalizeString(props.order.id))
const canTouchHeader = computed(() =>
  Boolean(orderId.value && props.headerActionLabel)
)
const canTouchBody = computed(() =>
  Boolean(orderId.value && props.bodyActionLabel)
)
const canTouchStatus = computed(() =>
  Boolean(orderId.value && props.statusActionLabel && !props.statusActionPending)
)
const lines = computed(() =>
  Array.isArray(props.order.items)
    ? props.order.items.map((item) => ({
        id: normalizeString(item.id) || normalizeString(item.label),
        label: normalizeString(item.label) || 'Item',
        addOns: Array.isArray(item.add_ons)
          ? item.add_ons
              .map((addOn) => normalizeString(addOn.label))
              .filter(Boolean)
          : [],
        variant: normalizeString(item.variant_label),
        qty: Number(item.quantity || 0),
      }))
    : []
)
const customerLines = computed(() => {
  const customer = record(orderRecord.value.customer)
  const payment = record(orderRecord.value.payment)
  const amount = Number(payment.amount_chf || 0)
  const paymentStatus = normalizeString(payment.status)
  const paymentMethod = normalizeString(payment.method)
  const paymentMethodLabels: Record<string, string> = {
    cash: 'cash on delivery',
    card_to_driver: 'card on delivery',
    card_at_pickup: 'card at pickup',
    online_card: 'online card',
    deposit: 'deposit',
  }
  const paymentLine = paymentStatus && paymentStatus !== 'not_required'
    ? `Payment ${paymentStatus}${amount ? ` · CHF ${amount.toFixed(2)}` : ''}`
    : paymentMethod
      ? `Payment ${paymentMethodLabels[paymentMethod] || paymentMethod}`
      : ''
  return [
    normalizeString(customer.name),
    normalizeString(customer.phone),
    normalizeString(customer.address),
    Number(customer.party_size || 0) > 0
      ? `${Number(customer.party_size)} people`
      : '',
    paymentLine,
    normalizeString(customer.notes),
  ].filter(Boolean)
})

function trashOrder() {
  if (!orderId.value) return
  emit('trash', orderId.value)
}

function touchHeader() {
  if (!canTouchHeader.value) return
  emit('touch-header', orderId.value)
}

function touchBody() {
  if (!canTouchBody.value) return
  emit('touch-body', orderId.value)
}

function touchStatus() {
  if (!canTouchStatus.value) return
  emit('touch-status', orderId.value)
}

async function copyTicket() {
  if (!orderId.value || !import.meta.client || !navigator.clipboard) return

  await navigator.clipboard.writeText(JSON.stringify({
    surface: 'kitchen_console_order_ticket',
    copied_at: new Date().toISOString(),
    order_id: orderId.value,
    label: orderLabel.value,
    header: headerLabel.value,
    status: statusLabel.value,
    service_mode: serviceMode.value,
    lines: lines.value,
    customer_lines: customerLines.value,
    order: orderRecord.value,
  }, null, 2))
  copied.value = true
  window.setTimeout(() => {
    copied.value = false
  }, 1400)
}
</script>

<style scoped>
.order-ticket__copy {
  display: inline-flex;
  gap: 0.3rem;
  align-items: center;
  flex: 0 0 auto;
  min-height: 1.65rem;
  padding: 0.15rem 0.4rem;
  border: 1px solid var(--ui-border);
  border-radius: 999px;
  background: var(--ui-bg-elevated);
  color: var(--ui-text-highlighted);
  cursor: pointer;
  font: inherit;
  font-size: 0.72rem;
  font-weight: 750;
}

.order-ticket__copy:disabled {
  cursor: not-allowed;
  opacity: 0.55;
}

.order-ticket__status-action {
  display: inline-flex;
  gap: 0.35rem;
  align-items: center;
  min-height: 1.5rem;
  padding: 0.125rem 0.375rem;
  border: 0;
  border-radius: 0.25rem;
  background: transparent;
  color: var(--ui-text-dimmed);
  cursor: pointer;
  font: inherit;
  font-size: 0.75rem;
  font-weight: 500;
}

.order-ticket__status-action:hover {
  background: var(--ui-bg-muted);
  color: var(--ui-text-highlighted);
}

.order-ticket__status-action:disabled {
  cursor: wait;
  opacity: 0.82;
}

.order-ticket__waiting-status {
  display: inline-flex;
  gap: 0.35rem;
  align-items: center;
  flex: 0 0 auto;
  color: var(--ui-text-dimmed);
  font-size: 0.72rem;
  font-weight: 700;
}

.order-ticket__spinner {
  width: 0.75rem;
  height: 0.75rem;
  border: 2px solid color-mix(in srgb, currentColor 24%, transparent);
  border-top-color: currentColor;
  border-radius: 999px;
  animation: order-ticket-spin 0.8s linear infinite;
}

@keyframes order-ticket-spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
