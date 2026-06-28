<template>
  <section class="menu-order-items" aria-label="Selected order items">
    <header class="menu-order-items__header">
      <div>
        <p class="menu-order-items__eyebrow">
          Basket
        </p>
        <h2>Your items</h2>
      </div>

      <button
        type="button"
        class="menu-order-items__close"
        aria-label="Close basket"
        @click="$emit('close')"
      >
        Close
      </button>
    </header>

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
  (event: 'close'): void
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
