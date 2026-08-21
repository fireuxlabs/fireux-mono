<template>
  <button
    v-show="alwaysVisible || quantity > 0"
    type="button"
    class="menu-order-basket-summary"
    data-menu-order-basket="local"
    data-menu-action="review-basket"
    data-menu-basket-persistence="none"
    :data-menu-basket-state="quantity > 0 ? 'ready' : 'empty'"
    :data-menu-basket-quantity="quantity"
    :data-menu-basket-total="totalMarker"
    :aria-label="`${summaryLabel}. Review basket.`"
    @click="reviewBasket"
  >
    <span class="menu-order-basket-summary__icon" aria-hidden="true">
      <UIcon name="i-lucide-shopping-basket" />
    </span>
    <span class="menu-order-basket-summary__copy">
      <strong>{{ label }}</strong>
      <span>{{ quantityLabel }}</span>
    </span>
    <strong class="menu-order-basket-summary__total">
      {{ totalLabel }}
    </strong>
    <UIcon
      class="menu-order-basket-summary__chevron"
      name="i-lucide-chevron-right"
      aria-hidden="true"
    />
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  alwaysVisible?: boolean
  currencyCode: string
  label?: string
  quantity: number
  total: number
  totalLabel: string
}>()

const emit = defineEmits<{
  (event: 'review', trigger: HTMLButtonElement): void
}>()
const label = computed(() => String(props.label || 'Basket').trim())

const quantityLabel = computed(
  () => `${props.quantity} ${props.quantity === 1 ? 'item' : 'items'}`
)
const totalMarker = computed(() =>
  Math.max(0, Number(props.total || 0)).toFixed(2)
)
const summaryLabel = computed(() =>
  [
    label.value,
    quantityLabel.value,
    props.totalLabel || `0 ${props.currencyCode}`,
  ]
    .filter(Boolean)
    .join(', ')
)

function reviewBasket(event: MouseEvent) {
  const trigger = event.currentTarget
  if (trigger instanceof HTMLButtonElement) emit('review', trigger)
}
</script>

<style scoped>
.menu-order-basket-summary {
  position: sticky;
  z-index: 20;
  bottom: max(calc(var(--spacing) * 4), env(safe-area-inset-bottom));
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) max-content auto;
  gap: 0.85rem;
  align-items: center;
  width: min(100%, 32rem);
  margin: 0 auto;
  padding: 0.8rem calc(var(--spacing) * 4);
  border: 1px solid color-mix(in srgb, var(--menu-primary) 40%, transparent);
  border-radius: var(--menu-radius);
  background: color-mix(in srgb, var(--menu-bg) 92%, var(--menu-primary));
  box-shadow: 0 0.8rem 2.5rem rgb(15 23 42 / 18%);
  color: var(--menu-text);
  cursor: pointer;
  font: inherit;
  text-align: left;
}

.menu-order-basket-summary:focus-visible {
  outline: 2px solid var(--menu-primary);
  outline-offset: 0.25rem;
}

.menu-order-basket-summary__icon {
  display: grid;
  width: 2.5rem;
  height: 2.5rem;
  place-items: center;
  border-radius: 9999px;
  background: color-mix(in srgb, var(--menu-primary) 15%, var(--menu-bg));
  color: var(--menu-primary);
}

.menu-order-basket-summary__copy {
  display: grid;
  gap: 0.1rem;
  min-width: 0;
}

.menu-order-basket-summary__copy strong {
  color: var(--menu-title);
  font-size: 0.9rem;
}

.menu-order-basket-summary__copy span {
  color: var(--menu-muted);
  font-size: var(--text-xs);
  font-weight: var(--font-weight-bold);
}

.menu-order-basket-summary__total {
  color: var(--menu-primary);
  font-size: 0.95rem;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}

.menu-order-basket-summary__chevron {
  color: var(--menu-primary);
}
</style>
