<template>
  <button
    type="button"
    class="receiving-row"
    :class="{ 'receiving-row--selected': selected }"
    :aria-current="selected ? 'true' : undefined"
    @click="$emit('select')"
  >
    <UIcon :name="surface.icon" class="receiving-row__icon" aria-hidden="true" />

    <span class="receiving-row__copy">
      <strong>{{ surface.label }}</strong>
      <span>{{ orderLabel }}</span>
    </span>

    <UBadge color="neutral" variant="soft" size="sm">
      {{ itemCount }}
    </UBadge>
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { KitchenOrder } from '../../../../../../models/kitchen/order.model'
import { kitchenOrderOperatorLabel } from '../../../../../../utils/kitchen-order-label'

defineOptions({ name: 'ConsoleKitchenOperationsOrdersReceivingRow' })

const props = defineProps<{
  order: KitchenOrder
  selected: boolean
}>()

defineEmits<{ select: [] }>()

const normalize = (value: unknown) => String(value ?? '').trim()
const surface = computed(() => {
  const type = normalize(props.order.order_type)
  if (type === 'delivery') return { label: 'Delivery', icon: 'i-lucide-bike' }
  if (type === 'pre_order') return { label: 'Pre-order', icon: 'i-lucide-calendar-clock' }

  const collection = props.order.collection as { mode?: unknown }
  return normalize(collection?.mode) === 'scheduled'
    ? { label: 'Scheduled collection', icon: 'i-lucide-calendar-clock' }
    : { label: 'Collection', icon: 'i-lucide-shopping-bag' }
})
const orderLabel = computed(() =>
  kitchenOrderOperatorLabel(props.order as Record<string, unknown>)
)
const itemCount = computed(() =>
  Array.isArray(props.order.items)
    ? props.order.items.reduce(
        (total, item) => total + Math.max(1, Number(item.quantity || 1)),
        0
      )
    : 0
)
</script>

<style scoped>
.receiving-row {
  align-items: center;
  background: transparent;
  border: 1px solid transparent;
  border-radius: var(--ui-radius);
  color: inherit;
  cursor: pointer;
  display: grid;
  gap: calc(var(--spacing) * 2);
  grid-template-columns: auto minmax(0, 1fr) auto;
  padding: calc(var(--spacing) * 2.5);
  text-align: left;
  width: 100%;
}

.receiving-row:hover {
  background: var(--ui-bg-muted);
}

.receiving-row--selected {
  background: var(--ui-bg-elevated);
  border-color: var(--ui-primary);
}

.receiving-row__copy {
  display: grid;
  min-width: 0;
}

.receiving-row__copy span {
  color: var(--ui-text-muted);
  font-size: 0.75rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.receiving-row__icon {
  color: var(--ui-primary);
}

@media (max-width: 48rem) {
  .receiving-row {
    flex: 0 0 15rem;
  }
}
</style>
