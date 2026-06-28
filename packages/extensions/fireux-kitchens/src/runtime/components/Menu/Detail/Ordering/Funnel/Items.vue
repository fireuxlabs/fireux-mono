<template>
  <section class="menu-order-items" aria-label="Selected order items">
    <ul class="menu-order-items__list">
      <li
        v-for="item in selection.items"
        :key="item.lineId || item.id"
        class="menu-order-items__item"
      >
        <span class="menu-order-items__quantity">{{ item.quantity }}x</span>
        <span class="menu-order-items__name">{{ item.name }}</span>
        <span class="menu-order-items__price">{{ lineTotal(item) }}</span>
      </li>
    </ul>

    <div class="menu-order-items__footer">
      <p>
        <span>Total</span>
        <strong>{{ totalLabel }}</strong>
      </p>

      <button
        type="button"
        class="menu-order-items__continue"
        @click="$emit('continue')"
      >
        Continue
      </button>
    </div>
  </section>
</template>

<script setup lang="ts">
import type {
  MenuOrderingBasketItem,
  MenuOrderingSelectionSummary,
} from '../types'

defineProps<{
  selection: MenuOrderingSelectionSummary
  totalLabel: string
}>()

defineEmits<{
  (event: 'continue'): void
}>()

const money = (value: number) =>
  new Intl.NumberFormat('de-CH', {
    style: 'currency',
    currency: 'CHF',
  }).format(value)

function lineTotal(item: MenuOrderingBasketItem) {
  const quantity = Math.max(0, Number(item.quantity || 0))
  const unitPrice = Math.max(0, Number(item.unitPrice || 0))

  return unitPrice ? money(quantity * unitPrice) : ''
}
</script>

<style scoped>
.menu-order-items {
  display: grid;
  gap: 1rem;
}

.menu-order-items__list {
  display: grid;
  gap: 0.65rem;
  margin: 0;
  padding: 0;
  list-style: none;
}

.menu-order-items__item {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  gap: 0.75rem;
  align-items: center;
  padding: 0.85rem 0;
  border-bottom: 1px solid color-mix(in srgb, var(--menu-text) 10%, transparent);
}

.menu-order-items__quantity {
  color: var(--menu-primary);
  font-size: 0.88rem;
  font-weight: 950;
}

.menu-order-items__name {
  color: var(--menu-title);
  font-weight: 900;
  line-height: 1.25;
}

.menu-order-items__price {
  color: var(--menu-muted);
  font-size: 0.88rem;
  font-weight: 850;
  text-align: right;
}

.menu-order-items__footer {
  display: flex;
  gap: 1rem;
  align-items: center;
  justify-content: space-between;
  padding-top: 0.25rem;
}

.menu-order-items__footer p {
  display: grid;
  gap: 0.15rem;
  margin: 0;
}

.menu-order-items__footer span {
  color: var(--menu-muted);
  font-size: 0.76rem;
  font-weight: 850;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.menu-order-items__footer strong {
  color: var(--menu-title);
  font-size: clamp(1.35rem, 5vw, 2rem);
  font-weight: 950;
  letter-spacing: -0.05em;
}

.menu-order-items__continue {
  min-height: 2.6rem;
  padding: 0.65rem 1rem;
  border: 0;
  border-radius: 999px;
  background: var(--menu-primary);
  color: var(--menu-bg);
  cursor: pointer;
  font: inherit;
  font-size: 0.88rem;
  font-weight: 900;
}

@media (max-width: 640px) {
  .menu-order-items__footer {
    display: grid;
  }

  .menu-order-items__continue {
    width: 100%;
  }
}
</style>
