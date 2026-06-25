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
        </span>
        <span class="flex shrink-0 items-center gap-2">
          <button
            v-if="canTouchStatus"
            class="rounded px-1.5 py-0.5 text-xs font-medium text-dimmed hover:bg-muted hover:text-highlighted"
            type="button"
            :aria-label="statusActionAriaLabel || statusActionLabel"
            @click.stop="touchStatus"
          >
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
      </div>

      <div class="flex h-12 shrink-0 items-center px-4 text-xs font-medium text-dimmed">
        {{ orderLabel }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { KitchenOrder } from '../../../models/order.model'

const props = withDefaults(
  defineProps<{
    order: KitchenOrder
    trashMode?: boolean
    headerActionLabel?: string
    bodyActionLabel?: string
    statusActionLabel?: string
    statusActionAriaLabel?: string
  }>(),
  {
    trashMode: false,
    headerActionLabel: '',
    bodyActionLabel: '',
    statusActionLabel: '',
    statusActionAriaLabel: '',
  }
)
const emit = defineEmits<{
  (event: 'trash', id: string): void
  (event: 'touch-header', id: string): void
  (event: 'touch-body', id: string): void
  (event: 'touch-status', id: string): void
}>()

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

const placedMs = computed(
  () =>
    timestampMs((props.order as any).created?.at) ||
    timestampMs((props.order as any).created_at) ||
    timestampMs((props.order as any).updated?.at) ||
    timestampMs((props.order as any).updated_at)
)
const pickupMs = computed(() =>
  timestampMs(
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
    ['eat_in', 'eat-in', 'dine_in', 'dine-in', 'table'].includes(value) ||
    value.includes('eat in') ||
    value.includes('dine')
  ) {
    return 'eat_in'
  }
  return value
})
const headerIcon = computed(() =>
  serviceMode.value === 'collection'
    ? 'i-lucide-shopping-bag'
    : serviceMode.value === 'delivery'
      ? 'i-lucide-bike'
      : serviceMode.value === 'eat_in'
        ? 'i-lucide-utensils'
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

  if (serviceMode.value === 'eat_in') {
    return 'Eat in'
  }

  return placedMs.value ? `Placed ${formatTime(placedMs.value)}` : 'Time unset'
})
const statusLabel = computed(() => {
  const fireState = normalizeString((props.order as any).fire_state)
  if (fireState === 'held') return 'held'
  if (fireState === 'ready_to_fire') return 'ready'

  const status = normalizeString(props.order.status)
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
  Boolean(orderId.value && props.statusActionLabel)
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
</script>
