<template>
  <div
    class="receiving-row"
    :class="{
      'receiving-row--inspected': inspected,
      'receiving-row--selected': selected,
    }"
  >
    <UButton
      class="receiving-row__select"
      size="lg"
      :color="selected ? 'primary' : 'neutral'"
      :variant="selected ? 'solid' : 'outline'"
      :icon="selected ? 'i-lucide-check' : undefined"
      :aria-label="selected ? `Deselect ${orderLabel}` : `Select ${orderLabel}`"
      @click="$emit('toggle-selection')"
    />

    <div class="receiving-row__body">
      <button
        type="button"
        class="receiving-row__inspect"
        :aria-current="inspected ? 'true' : undefined"
        @click="$emit('inspect')"
      >
        <span class="receiving-row__order">
          <strong>{{ surface.label }}</strong>
          <span>{{ orderLabel }}</span>
        </span>

        <span class="receiving-row__items">
          <strong>{{ itemCounts.food }} food</strong>
          <span>{{ itemCounts.drinks }} drinks</span>
        </span>
      </button>

      <UButton
        class="receiving-row__accept"
        size="lg"
        color="primary"
        variant="solid"
        :icon="acceptIcon"
        :label="acceptLabel"
        :loading="accepting"
        :disabled="!canInteract"
        @click="
          $emit('accept', {
            id: normalize(order.id),
            estimatedMinutes: isScheduled ? null : estimateMinutes,
          })
        "
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { KitchenOrder } from '../../../../../utils/order.ts'
import { kitchenOrderOperatorLabel } from '../../../../../utils/kitchen-order-label'

defineOptions({ name: 'WorkspaceKitchenOperationsOrdersReceivingRow' })

const props = defineProps<{
  accepting: boolean
  canInteract: boolean
  estimateMinutes: number
  inspected: boolean
  nowMs: number
  order: KitchenOrder
  selected: boolean
}>()

defineEmits<{
  accept: [payload: { id: string; estimatedMinutes: number | null }]
  inspect: []
  'toggle-selection': []
}>()

const normalize = (value: unknown) => String(value ?? '').trim()
const record = (value: unknown): Record<string, unknown> =>
  value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {}
const timestampMs = (value: unknown) => {
  if (value instanceof Date) return value.getTime()
  if (typeof value === 'number')
    return value > 1_000_000_000_000 ? value : value * 1000

  const source = value as { seconds?: number; toMillis?: () => number } | null
  if (typeof source?.toMillis === 'function') return source.toMillis()

  const seconds = Number(source?.seconds)
  if (Number.isFinite(seconds) && seconds > 0) return seconds * 1000

  const parsed = Date.parse(normalize(value))
  return Number.isFinite(parsed) ? parsed : 0
}
const collection = computed(() => record(props.order.collection))
const isScheduled = computed(
  () =>
    props.order.order_type === 'pre_order' ||
    (props.order.order_type === 'collection' &&
      normalize(collection.value.mode) === 'scheduled')
)
const surface = computed(() => {
  if (props.order.order_type === 'delivery') return { label: 'Delivery' }
  if (props.order.order_type === 'pre_order') return { label: 'Pre-order' }
  return { label: isScheduled.value ? 'Scheduled' : 'Collection' }
})
const orderLabel = computed(() =>
  kitchenOrderOperatorLabel(props.order as Record<string, unknown>)
)
const itemCounts = computed(() =>
  (props.order.items || []).reduce(
    (counts, item) => {
      const quantity = Math.max(1, Number(item.quantity || 1))
      if (item.item_kind === 'drink') counts.drinks += quantity
      else counts.food += quantity
      return counts
    },
    { food: 0, drinks: 0 }
  )
)
const requestedTime = computed(() =>
  timestampMs(collection.value.requested_for || props.order.requested_for)
)
const deadline = computed(() => {
  if (!isScheduled.value) return `${props.estimateMinutes} min`
  if (!requestedTime.value) return 'Time needed'

  const requested = new Date(requestedTime.value)
  const day = isToday(requested)
    ? ''
    : isTomorrow(requested)
      ? 'Tomorrow '
      : new Intl.DateTimeFormat('en-GB', { weekday: 'short' }).format(
          requested
        ) + ' '

  return (
    day +
    new Intl.DateTimeFormat('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).format(requested)
  )
})
const acceptIcon = computed(() =>
  isScheduled.value ? 'i-lucide-calendar-clock' : 'i-lucide-clock-3'
)
const acceptLabel = computed(() =>
  isScheduled.value
    ? `Accept · ${deadline.value}`
    : `Accept · ${props.estimateMinutes}m`
)

function isToday(value: Date) {
  return dayKey(value) === dayKey(new Date(props.nowMs))
}

function isTomorrow(value: Date) {
  const tomorrow = new Date(props.nowMs)
  tomorrow.setDate(tomorrow.getDate() + 1)
  return dayKey(value) === dayKey(tomorrow)
}

function dayKey(value: Date) {
  return `${value.getFullYear()}-${value.getMonth()}-${value.getDate()}`
}
</script>

<style scoped>
.receiving-row {
  align-items: center;
  display: grid;
  gap: calc(var(--spacing) * 2);
  grid-template-columns: auto minmax(0, 1fr);
}

.receiving-row__select {
  min-height: calc(var(--spacing) * 11);
  min-width: calc(var(--spacing) * 11);
}

.receiving-row__body {
  align-items: center;
  background: transparent;
  border: 1px solid var(--ui-border-accented);
  border-radius: var(--ui-radius);
  color: inherit;
  display: grid;
  gap: calc(var(--spacing) * 2);
  grid-template-columns: minmax(0, 1fr) auto;
  min-width: 0;
  padding: calc(var(--spacing) * 2);
}

.receiving-row__body:hover {
  background: var(--ui-bg-muted);
}

.receiving-row--inspected .receiving-row__body {
  border-color: var(--ui-primary);
}

.receiving-row--selected .receiving-row__body {
  background: var(--ui-bg-muted);
}

.receiving-row__inspect {
  align-items: center;
  background: transparent;
  border: 0;
  color: inherit;
  cursor: pointer;
  display: grid;
  gap: calc(var(--spacing) * 3);
  grid-template-columns: minmax(0, 1fr) minmax(5rem, auto);
  min-width: 0;
  padding: var(--spacing);
  text-align: left;
}

.receiving-row__order,
.receiving-row__items {
  display: grid;
  min-width: 0;
}

.receiving-row__order {
  gap: var(--spacing);
}

.receiving-row__order span,
.receiving-row__items span {
  color: var(--ui-text-muted);
  font-size: var(--text-xs);
}

.receiving-row__items {
  justify-items: start;
}

@media (max-width: 48rem) {
  .receiving-row {
    flex: 0 0 17rem;
  }

  .receiving-row__body {
    align-items: stretch;
    grid-template-columns: minmax(0, 1fr);
  }

  .receiving-row__accept {
    justify-content: center;
  }
}
</style>
