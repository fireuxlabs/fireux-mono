<template>
  <section class="grid gap-3 rounded-lg border border-default bg-muted/40 p-3">
    <div class="flex items-center justify-between gap-3 text-sm">
      <span class="font-semibold text-muted">
        Requested time
      </span>
      <strong class="text-base font-black text-highlighted">
        {{ requestedDateTimeLabel }}
      </strong>
    </div>

    <div
      v-if="partySize"
      class="flex items-center justify-between gap-3 text-sm"
    >
      <span class="font-semibold text-muted">
        Guests
      </span>
      <strong class="text-base font-black text-highlighted">
        {{ partySize }}
      </strong>
    </div>

    <UButton
      color="primary"
      block
      :disabled="!canAcceptRequested"
      :loading="accepting"
      @click="acceptRequested"
    >
      {{ canAcceptRequested ? 'Accept pre-order time' : 'Waiting for requested time' }}
    </UButton>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { KitchenOrder } from '../../../../../../models/kitchen/order.model'

const props = withDefaults(
  defineProps<{
    accepting?: boolean
    order: KitchenOrder
    orderId: string
  }>(),
  {
    accepting: false,
  }
)
const emit = defineEmits<{
  (event: 'accept', payload: { id: string; estimatedMinutes: number | null }): void
}>()

const normalize = (value: unknown) => String(value ?? '').trim()
const record = (value: unknown): Record<string, unknown> =>
  value && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {}
const orderRecord = computed(() => props.order as Record<string, unknown>)
const customer = computed(() => record(orderRecord.value.customer))
const requestedFor = computed(() =>
  normalize(orderRecord.value.requested_for)
)
const partySize = computed(() =>
  Math.max(0, Math.floor(Number(customer.value.party_size || 0)))
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
  Boolean(props.orderId && requestedFor.value)
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
