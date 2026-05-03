<template>
  <UCard class="w-[18rem] max-w-full shrink-0">
    <template #header>
      <div class="text-sm font-semibold text-highlighted">
        {{ createdTimeLabel || 'Time unset' }}
      </div>
    </template>

    <div class="space-y-1">
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

    <template #footer>
      <div class="text-xs font-medium text-dimmed">
        {{ orderLabel }}
      </div>
    </template>
  </UCard>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { KitchenOrder } from '../../../../models/order.model'

const props = withDefaults(
  defineProps<{
    order: KitchenOrder
  }>(),
  {}
)

const normalizeString = (value: unknown) => String(value ?? '').trim()
const timestampMs = (value: unknown) => {
  const seconds = Number((value as { seconds?: number } | null)?.seconds)
  return Number.isFinite(seconds) && seconds > 0 ? seconds * 1000 : 0
}
const formatTime = (value: number) =>
  new Date(value).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  })

const placedMs = computed(
  () =>
    timestampMs((props.order as any).created?.at) ||
    timestampMs((props.order as any).updated?.at)
)
const createdTimeLabel = computed(() => (placedMs.value ? formatTime(placedMs.value) : ''))
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
