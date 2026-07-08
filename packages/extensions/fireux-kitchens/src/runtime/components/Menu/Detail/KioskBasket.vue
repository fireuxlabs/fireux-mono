<template>
  <footer class="kiosk-basket">
    <div>
      <strong>{{ quantity }}</strong>
      <span>{{ quantity === 1 ? 'item' : 'items' }}</span>
    </div>

    <p>{{ total }}</p>

    <button
      type="button"
      :disabled="!quantity"
      @click="$emit('open')"
    >
      <UIcon name="i-lucide-shopping-basket" aria-hidden="true" />
      <span>Basket</span>
    </button>
  </footer>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { MenuOrderingFunnelState } from '../../../models/kitchen/menu/menu-ordering.model'

const props = defineProps<{
  basket?: MenuOrderingFunnelState | null
}>()

defineEmits<{
  (event: 'open'): void
}>()

const quantity = computed(() => props.basket?.quantity ?? 0)
const totalValue = computed(() =>
  (props.basket?.items ?? []).reduce(
    (sum, item) => sum + item.quantity * (item.unitPrice ?? 0),
    0
  )
)
const total = computed(() =>
  totalValue.value
    ? `${totalValue.value.toFixed(2)} ${props.basket?.currencyCode || ''}`.trim()
    : props.basket?.currencyCode || ''
)
</script>

<style scoped>
.kiosk-basket {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  gap: 1rem;
  align-items: center;
  padding: 1rem clamp(1rem, 2vw, 1.5rem);
  border-top: 1px solid rgb(255 255 255 / 18%);
  background: color-mix(in srgb, var(--kiosk-secondary) 58%, transparent);
  color: white;
}

.kiosk-basket div {
  display: flex;
  gap: 0.5rem;
  align-items: baseline;
}

.kiosk-basket strong,
.kiosk-basket p {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 950;
}

.kiosk-basket span {
  color: color-mix(in srgb, white 72%, transparent);
  font-size: 0.95rem;
  font-weight: 900;
  text-transform: uppercase;
}

.kiosk-basket button {
  display: inline-flex;
  min-height: 3.75rem;
  align-items: center;
  gap: 0.65rem;
  padding: 0 1.25rem;
  border: 1px solid color-mix(in srgb, var(--kiosk-primary) 78%, white);
  border-radius: 999px;
  background: color-mix(in srgb, var(--kiosk-primary) 22%, transparent);
  color: white;
  cursor: pointer;
  font: inherit;
  font-size: 1rem;
  font-weight: 950;
}

.kiosk-basket button:disabled {
  cursor: default;
  opacity: 0.42;
}
</style>
