<template>
  <div
    class="w-[18rem] max-w-full shrink-0 self-start overflow-hidden rounded-lg bg-default shadow-sm"
    :class="
      next
        ? 'border-2 border-primary ring-2 ring-primary/20'
        : 'border border-default'
    "
  >
    <div class="divide-y divide-default">
      <div class="flex h-12 shrink-0 items-center justify-between gap-3 px-4 text-sm font-semibold text-highlighted">
        <span class="flex min-w-0 items-center gap-2">
          <UIcon :name="headerIcon" class="size-4 shrink-0" />
          <span class="truncate">{{ headerLabel }}</span>
        </span>
        <UBadge
          v-if="next"
          color="primary"
          variant="soft"
          size="xs"
          class="shrink-0"
        >
          Next
        </UBadge>
      </div>

      <div class="space-y-1 p-4">
        <div
          v-for="line in lines"
          :key="line.id"
          class="flex items-start gap-2 text-sm"
        >
          <span class="w-6 shrink-0 font-semibold">{{ line.qty }}x</span>
          <span class="min-w-0">{{ line.label }}</span>
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
    next?: boolean
  }>(),
  {
    next: false,
  }
)

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
  new Date(value).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  })

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
      'pickup_at',
      'pickup_time',
      'collection_at',
      'requested_for',
      'due_at',
    ]),
    placedMs.value
  )
)
const serviceMode = computed(() => {
  const value = normalizeString(
    orderValue([
      'service_mode',
      'serviceMode',
      'fulfilment_type',
      'fulfillment_type',
      'order_type',
      'channel',
    ])
  ).toLowerCase()

  if (['collection', 'collect', 'pickup', 'pick_up'].includes(value)) return 'collection'
  if (['delivery', 'deliver'].includes(value)) return 'delivery'
  return value
})
const headerIcon = computed(() =>
  serviceMode.value === 'collection'
    ? 'i-lucide-shopping-bag'
    : serviceMode.value === 'delivery'
      ? 'i-lucide-bike'
      : 'i-lucide-clock'
)
const headerLabel = computed(() => {
  if (serviceMode.value === 'collection') {
    return pickupMs.value
      ? `Pick up ${formatTime(pickupMs.value)}`
      : 'Pick up time unset'
  }

  return placedMs.value ? `Placed ${formatTime(placedMs.value)}` : 'Time unset'
})
const orderLabel = computed(() => {
  const number = normalizeString(props.order.order_number)
  return number ? `Order #${number}` : normalizeString(props.order.id) || 'Order'
})
const lines = computed(() =>
  Array.isArray(props.order.items)
    ? props.order.items.map((item) => ({
        id: normalizeString(item.id) || normalizeString(item.label),
        label: normalizeString(item.label) || 'Item',
        qty: Number(item.quantity || 0),
      }))
    : []
)
</script>
