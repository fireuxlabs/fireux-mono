<template>
  <section
    v-if="isScheduledMode"
    class="grid gap-3 rounded-lg border border-default bg-muted/40 p-3"
  >
    <div class="flex items-center justify-between gap-3 text-sm">
      <span class="font-semibold text-muted">
        Requested pickup
      </span>
      <strong class="text-base font-black text-highlighted">
        {{ requestedDateTimeLabel }}
      </strong>
    </div>

    <UButton
      color="primary"
      block
      :disabled="!canAcceptRequested"
      :loading="accepting"
      @click="acceptRequested"
    >
      {{ canAcceptRequested ? 'Accept pickup time' : 'Waiting for pickup time' }}
    </UButton>
  </section>

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
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { KitchenOrder } from '../../../../../../models/kitchen/order.model'

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
  (event: 'accept', payload: { id: string; estimatedMinutes: number | null }): void
  (event: 'nudge-estimate', payload: { id: string; amount: number }): void
  (event: 'set-estimate', payload: { id: string; minutes: number }): void
}>()

const normalize = (value: unknown) => String(value ?? '').trim()
const record = (value: unknown): Record<string, unknown> =>
  value && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {}
const collection = computed(() =>
  record((props.order as Record<string, unknown>).collection)
)
const isScheduledMode = computed(() =>
  normalize(collection.value.mode) === 'scheduled'
)
const requestedFor = computed(() =>
  normalize(collection.value.requested_for)
)
const requestedDateTimeLabel = computed(() => {
  if (!requestedFor.value) return 'time needed'

  const parsed = Date.parse(requestedFor.value)
  if (!Number.isFinite(parsed)) return requestedFor.value

  const dateLabel = relativeDateLabel(parsed)
  const timeLabel = new Intl.DateTimeFormat('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(new Date(parsed))

  return `${dateLabel}, ${timeLabel}`
})
const canAcceptRequested = computed(() =>
  props.canInteract && Boolean(props.orderId && requestedFor.value)
)

function relativeDateLabel(value: number) {
  const date = startOfLocalDay(new Date(value))
  const today = startOfLocalDay(new Date())
  const days = Math.round((date.getTime() - today.getTime()) / 86_400_000)

  if (days === 0) return 'Today'
  if (days === 1) return 'Tomorrow'
  if (days === -1) return 'Yesterday'

  return new Intl.DateTimeFormat('en-GB', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
  }).format(new Date(value))
}

function startOfLocalDay(value: Date) {
  return new Date(value.getFullYear(), value.getMonth(), value.getDate())
}

function acceptRequested() {
  if (!canAcceptRequested.value) return
  emit('accept', {
    id: props.orderId,
    estimatedMinutes: null,
  })
}
</script>
